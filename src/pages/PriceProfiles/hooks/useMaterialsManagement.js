import { useState, useCallback } from "react";
import { collection, doc, addDoc, deleteDoc } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import {
  ADMIN_ERROR_MESSAGES,
  ADMIN_SUCCESS_MESSAGES,
} from "../../../utils/constants";

/**
 * Hook para gestionar operaciones CRUD de tamaños de plancha y tipos de máquina
 * Maneja estados de formulario y operaciones con Firestore
 *
 * @param {Object} notification - Hook de notificaciones
 * @param {string} priceProfileId - ID del perfil de precios actual
 */
export function useMaterialsManagement(notification, priceProfileId) {
  const { db, appId, userId } = useFirebase();

  // Estados de formulario para planchas
  const [newPlateSizeName, setNewPlateSizeName] = useState("");
  const [newPlateSizePrice, setNewPlateSizePrice] = useState("");

  // Estados de formulario para máquinas
  const [newMachineTypeName, setNewMachineTypeName] = useState("");
  const [newMachineTypeMillarPrice, setNewMachineTypeMillarPrice] =
    useState("");

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

  return {
    // Estados y handlers de planchas
    plates: {
      newPlateSizeName,
      setNewPlateSizeName,
      newPlateSizePrice,
      setNewPlateSizePrice,
      addPlateSize,
      deletePlateSize,
    },

    // Estados y handlers de máquinas
    machines: {
      newMachineTypeName,
      setNewMachineTypeName,
      newMachineTypeMillarPrice,
      setNewMachineTypeMillarPrice,
      addMachineType,
      deleteMachineType,
    },
  };
}
