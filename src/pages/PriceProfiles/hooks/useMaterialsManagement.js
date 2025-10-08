import { useState, useCallback, useEffect } from "react";
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

  // Reiniciar formularios de nueva plancha y máquina cuando cambia el perfil
  useEffect(() => {
    setNewPlateSizeName("");
    setNewPlateSizePrice("");
    setNewMachineTypeName("");
    setNewMachineTypeMillarPrice("");
  }, [priceProfileId]);

  // Sincronizar inputs de planchas cuando cambia el perfil
  useEffect(() => {
    const initialInputs = {};
    plateSizes.forEach((plate) => {
      initialInputs[plate.id] =
        plate.price !== undefined ? plate.price.toString() : "";
    });
    setPlatePriceInputs(initialInputs);
  }, [priceProfileId]);

  // Sincronizar inputs de máquinas cuando cambia el perfil
  useEffect(() => {
    const initialInputs = {};
    machineTypes.forEach((machine) => {
      initialInputs[machine.id] =
        machine.millarPrice !== undefined ? machine.millarPrice.toString() : "";
    });
    setMachinePriceInputs(initialInputs);
  }, [priceProfileId]);

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

    // Validar todos los precios antes de actualizar
    const validatedPrices = {};

    for (const [plateId, value] of Object.entries(platePriceInputs)) {
      if (!value) continue; // Skip empty inputs

      const plateName = plateSizes.find((p) => p.id === plateId)?.size;
      const validation = validatePrice(value, plateName);

      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }
      validatedPrices[plateId] = validation.value;
    }

    if (Object.keys(validatedPrices).length === 0) {
      notification.showError("No hay cambios pendientes para actualizar");
      return;
    }

    setLoadingPlatesAll(true);
    try {
      // Actualizar todos los precios en paralelo
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
      notification.showSuccess(
        `${Object.keys(validatedPrices).length} precios de plancha actualizados`
      );
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

    // Validar todos los precios antes de actualizar
    const validatedPrices = {};

    for (const [machineId, value] of Object.entries(machinePriceInputs)) {
      if (!value) continue; // Skip empty inputs

      const machineName = machineTypes.find((m) => m.id === machineId)?.name;
      const validation = validatePrice(value, machineName);

      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }
      validatedPrices[machineId] = validation.value;
    }

    if (Object.keys(validatedPrices).length === 0) {
      notification.showError("No hay cambios pendientes para actualizar");
      return;
    }

    setLoadingMachinesAll(true);
    try {
      // Actualizar todos los precios en paralelo
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
      notification.showSuccess(
        `${Object.keys(validatedPrices).length} precios de máquina actualizados`
      );
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
