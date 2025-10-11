import { useState, useCallback, useEffect, useRef } from "react";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import {
  ADMIN_ERROR_MESSAGES,
  ADMIN_SUCCESS_MESSAGES,
} from "../../../utils/constants";
import { validatePrice } from "../utils/priceValidation";

/**
 * Hook para gestionar operaciones CRUD de tamaños de plancha y tipos de máquina
 * Maneja estados de formulario y operaciones con Firestore
 *
 * @param {Object} notification - Hook de notificaciones
 * @param {string} priceProfileId - ID del perfil de precios actual
 * @param {Array} plateSizes - Lista de tamaños de plancha
 * @param {Array} machineTypes - Lista de tipos de máquina
 */
export function useMaterialsManagement(
  notification,
  priceProfileId,
  plateSizes = [],
  machineTypes = []
) {
  const { db, appId, userId } = useFirebase();

  // Estados de formulario para planchas
  const [newPlateSizeName, setNewPlateSizeName] = useState("");
  const [newPlateSizePrice, setNewPlateSizePrice] = useState("");

  // Estados de inputs para edición inline de planchas
  const [platePriceInputs, setPlatePriceInputs] = useState({});
  const [loadingPlatesAll, setLoadingPlatesAll] = useState(false);

  // Estados de formulario para máquinas
  const [newMachineTypeName, setNewMachineTypeName] = useState("");
  const [newMachineTypeMillarPrice, setNewMachineTypeMillarPrice] =
    useState("");

  // Estados de inputs para edición inline de máquinas
  const [machinePriceInputs, setMachinePriceInputs] = useState({});
  const [loadingMachinesAll, setLoadingMachinesAll] = useState("");

  // Ref para rastrear el último perfil cargado y los últimos valores
  const lastProfileIdRef = useRef(null);
  const lastPlatesRef = useRef([]);
  const lastMachinesRef = useRef([]);

  // Reiniciar formularios de nueva plancha y máquina cuando cambia el perfil
  useEffect(() => {
    setNewPlateSizeName("");
    setNewPlateSizePrice("");
    setNewMachineTypeName("");
    setNewMachineTypeMillarPrice("");
  }, [priceProfileId]);

  // Sincronizar inputs de planchas cuando cambia el perfil
  useEffect(() => {
    // Si cambia el perfil, resetear inputs
    if (lastProfileIdRef.current !== priceProfileId) {
      lastProfileIdRef.current = priceProfileId;
      setPlatePriceInputs({});
      lastPlatesRef.current = [];

      // Si no hay perfil, no continuar
      if (!priceProfileId) {
        return;
      }
    }

    // Solo actualizar inputs si los valores realmente cambiaron
    if (priceProfileId && plateSizes.length > 0) {
      const lastPlates = lastPlatesRef.current;
      let hasChanges = false;

      // Verificar si hay cambios reales
      if (plateSizes.length !== lastPlates.length) {
        hasChanges = true;
      } else {
        hasChanges = plateSizes.some(plate => {
          const lastPlate = lastPlates.find(p => p.id === plate.id);
          return !lastPlate || lastPlate.price !== plate.price;
        });
      }

      // Solo actualizar si hay cambios
      if (hasChanges) {
        const initialInputs = {};
        plateSizes.forEach((plate) => {
          initialInputs[plate.id] =
            plate.price !== undefined ? plate.price.toString() : "";
        });
        setPlatePriceInputs(initialInputs);
        lastPlatesRef.current = plateSizes.map(p => ({ ...p }));
      }
    }
  }, [priceProfileId, plateSizes]);

  // Sincronizar inputs de máquinas cuando cambia el perfil
  useEffect(() => {
    // Si cambia el perfil, resetear inputs de máquinas también
    if (lastProfileIdRef.current !== priceProfileId) {
      setMachinePriceInputs({});
      lastMachinesRef.current = [];

      // Si no hay perfil, no continuar
      if (!priceProfileId) {
        return;
      }
    }

    // Solo actualizar inputs si los valores realmente cambiaron
    if (priceProfileId && machineTypes.length > 0) {
      const lastMachines = lastMachinesRef.current;
      let hasChanges = false;

      // Verificar si hay cambios reales
      if (machineTypes.length !== lastMachines.length) {
        hasChanges = true;
      } else {
        hasChanges = machineTypes.some(machine => {
          const lastMachine = lastMachines.find(m => m.id === machine.id);
          return !lastMachine || lastMachine.millarPrice !== machine.millarPrice;
        });
      }

      // Solo actualizar si hay cambios
      if (hasChanges) {
        const initialInputs = {};
        machineTypes.forEach((machine) => {
          initialInputs[machine.id] =
            machine.millarPrice !== undefined ? machine.millarPrice.toString() : "";
        });
        setMachinePriceInputs(initialInputs);
        lastMachinesRef.current = machineTypes.map(m => ({ ...m }));
      }
    }
  }, [priceProfileId, machineTypes]);

  // Referencias a colecciones
  const getPlateCollectionRef = useCallback(() => {
    if (!priceProfileId) return null;
    return collection(
      db,
      `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/plateSizes`
    );
  }, [db, appId, userId, priceProfileId]);

  const getMachineCollectionRef = useCallback(() => {
    if (!priceProfileId) return null;
    return collection(
      db,
      `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/machineTypes`
    );
  }, [db, appId, userId, priceProfileId]);

  // ========== OPERACIONES DE PLANCHAS ==========

  // Añadir un nuevo tamaño de plancha
  const addPlateSize = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    if (!newPlateSizeName || !newPlateSizePrice) {
      notification.showError(ADMIN_ERROR_MESSAGES.PLATE_FIELDS_REQUIRED);
      return;
    }

    const price = parseFloat(newPlateSizePrice);
    if (isNaN(price) || price < 0) {
      notification.showError("El precio ingresado no es válido.");
      return;
    }

    const collectionRef = getPlateCollectionRef();
    if (!collectionRef) return;

    try {
      await addDoc(collectionRef, {
        size: newPlateSizeName,
        price: price,
      });

      notification.showSuccess(ADMIN_SUCCESS_MESSAGES.PLATE_ADDED);

      // Limpiar formulario
      setNewPlateSizeName("");
      setNewPlateSizePrice("");
    } catch (e) {
      console.error("Error adding plate size:", e);
      notification.showError("Error al añadir el tamaño de plancha.");
    }
  }, [
    userId,
    priceProfileId,
    newPlateSizeName,
    newPlateSizePrice,
    getPlateCollectionRef,
    notification,
  ]);

  // Eliminar un tamaño de plancha
  const deletePlateSize = useCallback(
    async (id) => {
      if (!userId) {
        notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
        return;
      }

      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/plateSizes`,
            id
          )
        );
        notification.showSuccess(ADMIN_SUCCESS_MESSAGES.PLATE_DELETED);
      } catch (e) {
        console.error("Error deleting plate size:", e);
        notification.showError("Error al eliminar el tipo de plancha.");
      }
    },
    [userId, db, appId, notification, priceProfileId]
  );

  // Handler para cambiar precio de plancha
  const handlePlatePriceInputChange = useCallback((plateId, value) => {
    setPlatePriceInputs((prev) => ({ ...prev, [plateId]: value }));
  }, []);

  // Actualizar precio de plancha individual
  const updatePlatePrice = useCallback(
    async (plateId) => {
      if (!userId) {
        notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
        return;
      }

      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      const priceStr = platePriceInputs[plateId];
      const plateName = plateSizes.find((p) => p.id === plateId)?.size;

      // Validar precio
      const validation = validatePrice(priceStr, plateName);
      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }

      try {
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/plateSizes`,
          plateId
        );
        await updateDoc(docRef, { price: validation.value });
        notification.showSuccess(`Precio de plancha ${plateName} actualizado`);
      } catch (e) {
        console.error("Error updating plate price:", e);
        notification.showError("Error al actualizar el precio de la plancha.");
      }
    },
    [
      userId,
      platePriceInputs,
      plateSizes,
      db,
      appId,
      notification,
      priceProfileId,
    ]
  );

  // Actualizar todos los precios de planchas
  const updateAllPlatePrices = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    // Validar solo los precios que han cambiado realmente
    const validatedPrices = {};
    const updatedPlateNames = [];

    for (const [plateId, value] of Object.entries(platePriceInputs)) {
      if (!value) continue; // Skip empty inputs

      const plate = plateSizes.find((p) => p.id === plateId);
      const plateName = plate?.size;

      // Comparar con el valor actual para solo actualizar lo que cambió
      const currentPrice = plate?.price || 0;
      const newPrice = parseFloat(value);

      // Solo validar y actualizar si hay un cambio real
      if (!isNaN(newPrice) && newPrice !== currentPrice) {
        const validation = validatePrice(value, plateName);

        if (!validation.isValid) {
          notification.showError(validation.error);
          return;
        }
        validatedPrices[plateId] = validation.value;
        updatedPlateNames.push(plateName);
      }
    }

    if (Object.keys(validatedPrices).length === 0) {
      notification.showError("No hay cambios pendientes para actualizar");
      return;
    }

    setLoadingPlatesAll(true);
    try {
      // Actualizar solo los precios que cambiaron
      const updatePromises = Object.entries(validatedPrices).map(
        ([plateId, value]) => {
          const docRef = doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/plateSizes`,
            plateId
          );
          return updateDoc(docRef, { price: value });
        }
      );

      await Promise.all(updatePromises);

      // Mensaje claro indicando qué placas se actualizaron
      const count = updatedPlateNames.length;
      if (count === 1) {
        notification.showSuccess(`Plancha actualizada: ${updatedPlateNames[0]}`);
      } else if (count <= 3) {
        notification.showSuccess(
          `Planchas actualizadas: ${updatedPlateNames.join(", ")}`
        );
      } else {
        notification.showSuccess(
          `${count} planchas actualizadas: ${updatedPlateNames.slice(0, 2).join(", ")} y ${count - 2} más`
        );
      }
    } catch (e) {
      console.error("Error updating plate prices:", e);
      notification.showError("Error al actualizar los precios de planchas");
    } finally {
      setLoadingPlatesAll(false);
    }
  }, [
    userId,
    platePriceInputs,
    plateSizes,
    db,
    appId,
    notification,
    priceProfileId,
  ]);

  // ========== OPERACIONES DE MÁQUINAS ==========

  // Añadir un nuevo tipo de máquina
  const addMachineType = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    if (!newMachineTypeName || !newMachineTypeMillarPrice) {
      notification.showError(ADMIN_ERROR_MESSAGES.MACHINE_FIELDS_REQUIRED);
      return;
    }

    const price = parseFloat(newMachineTypeMillarPrice);
    if (isNaN(price) || price < 0) {
      notification.showError("El precio ingresado no es válido.");
      return;
    }

    const collectionRef = getMachineCollectionRef();
    if (!collectionRef) return;

    try {
      await addDoc(collectionRef, {
        name: newMachineTypeName,
        millarPrice: price,
      });

      notification.showSuccess(ADMIN_SUCCESS_MESSAGES.MACHINE_ADDED);

      // Limpiar formulario
      setNewMachineTypeName("");
      setNewMachineTypeMillarPrice("");
    } catch (e) {
      console.error("Error adding machine type:", e);
      notification.showError("Error al añadir el tipo de máquina.");
    }
  }, [
    userId,
    priceProfileId,
    newMachineTypeName,
    newMachineTypeMillarPrice,
    getMachineCollectionRef,
    notification,
  ]);

  // Eliminar un tipo de máquina
  const deleteMachineType = useCallback(
    async (id) => {
      if (!userId) {
        notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
        return;
      }

      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/machineTypes`,
            id
          )
        );
        notification.showSuccess(ADMIN_SUCCESS_MESSAGES.MACHINE_DELETED);
      } catch (e) {
        console.error("Error deleting machine type:", e);
        notification.showError("Error al eliminar el tipo de máquina.");
      }
    },
    [userId, db, appId, notification, priceProfileId]
  );

  // Handler para cambiar precio de máquina
  const handleMachinePriceInputChange = useCallback((machineId, value) => {
    setMachinePriceInputs((prev) => ({ ...prev, [machineId]: value }));
  }, []);

  // Actualizar precio de máquina individual
  const updateMachinePrice = useCallback(
    async (machineId) => {
      if (!userId) {
        notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
        return;
      }

      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      const priceStr = machinePriceInputs[machineId];
      const machineName = machineTypes.find((m) => m.id === machineId)?.name;

      // Validar precio
      const validation = validatePrice(priceStr, machineName);
      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }

      try {
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/machineTypes`,
          machineId
        );
        await updateDoc(docRef, { millarPrice: validation.value });
        notification.showSuccess(
          `Precio de máquina ${machineName} actualizado`
        );
      } catch (e) {
        console.error("Error updating machine price:", e);
        notification.showError("Error al actualizar el precio de la máquina.");
      }
    },
    [
      userId,
      machinePriceInputs,
      machineTypes,
      db,
      appId,
      notification,
      priceProfileId,
    ]
  );

  // Actualizar todos los precios de máquinas
  const updateAllMachinePrices = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    // Validar solo los precios que han cambiado realmente
    const validatedPrices = {};
    const updatedMachineNames = [];

    for (const [machineId, value] of Object.entries(machinePriceInputs)) {
      if (!value) continue; // Skip empty inputs

      const machine = machineTypes.find((m) => m.id === machineId);
      const machineName = machine?.name;

      // Comparar con el valor actual para solo actualizar lo que cambió
      const currentPrice = machine?.millarPrice || 0;
      const newPrice = parseFloat(value);

      // Solo validar y actualizar si hay un cambio real
      if (!isNaN(newPrice) && newPrice !== currentPrice) {
        const validation = validatePrice(value, machineName);

        if (!validation.isValid) {
          notification.showError(validation.error);
          return;
        }
        validatedPrices[machineId] = validation.value;
        updatedMachineNames.push(machineName);
      }
    }

    if (Object.keys(validatedPrices).length === 0) {
      notification.showError("No hay cambios pendientes para actualizar");
      return;
    }

    setLoadingMachinesAll(true);
    try {
      // Actualizar solo los precios que cambiaron
      const updatePromises = Object.entries(validatedPrices).map(
        ([machineId, value]) => {
          const docRef = doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/machineTypes`,
            machineId
          );
          return updateDoc(docRef, { millarPrice: value });
        }
      );

      await Promise.all(updatePromises);

      // Mensaje claro indicando qué máquinas se actualizaron
      const count = updatedMachineNames.length;
      if (count === 1) {
        notification.showSuccess(`Máquina actualizada: ${updatedMachineNames[0]}`);
      } else if (count <= 3) {
        notification.showSuccess(
          `Máquinas actualizadas: ${updatedMachineNames.join(", ")}`
        );
      } else {
        notification.showSuccess(
          `${count} máquinas actualizadas: ${updatedMachineNames.slice(0, 2).join(", ")} y ${count - 2} más`
        );
      }
    } catch (e) {
      console.error("Error updating machine prices:", e);
      notification.showError("Error al actualizar los precios de máquinas");
    } finally {
      setLoadingMachinesAll(false);
    }
  }, [
    userId,
    machinePriceInputs,
    machineTypes,
    db,
    appId,
    notification,
    priceProfileId,
  ]);

  return {
    // Estados y handlers de planchas
    plates: {
      newPlateSizeName,
      setNewPlateSizeName,
      newPlateSizePrice,
      setNewPlateSizePrice,
      platePriceInputs,
      handlePlatePriceInputChange,
      addPlateSize,
      updatePlatePrice,
      deletePlateSize,
      updateAllPlatePrices,
      loadingPlatesAll,
    },

    // Estados y handlers de máquinas
    machines: {
      newMachineTypeName,
      setNewMachineTypeName,
      newMachineTypeMillarPrice,
      setNewMachineTypeMillarPrice,
      machinePriceInputs,
      handleMachinePriceInputChange,
      addMachineType,
      updateMachinePrice,
      deleteMachineType,
      updateAllMachinePrices,
      loadingMachinesAll,
    },
  };
}
