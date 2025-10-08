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
 */
export function useMaterialsManagement(notification) {
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
    return collection(db, `artifacts/${appId}/public/data/plateSizes`);
  }, [db, appId]);

  const getMachineCollectionRef = useCallback(() => {
    return collection(db, `artifacts/${appId}/public/data/machineTypes`);
  }, [db, appId]);

  // ========== OPERACIONES DE PLANCHAS ==========

  // Añadir un nuevo tamaño de plancha
  const addPlateSize = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
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

    try {
      await addDoc(getPlateCollectionRef(), {
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

      try {
        await deleteDoc(
          doc(db, `artifacts/${appId}/public/data/plateSizes`, id)
        );
        notification.showSuccess(ADMIN_SUCCESS_MESSAGES.PLATE_DELETED);
      } catch (e) {
        console.error("Error deleting plate size:", e);
        notification.showError("Error al eliminar el tipo de plancha.");
      }
    },
    [userId, db, appId, notification]
  );

  // ========== OPERACIONES DE MÁQUINAS ==========

  // Añadir un nuevo tipo de máquina
  const addMachineType = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
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

    try {
      await addDoc(getMachineCollectionRef(), {
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

      try {
        await deleteDoc(
          doc(db, `artifacts/${appId}/public/data/machineTypes`, id)
        );
        notification.showSuccess(ADMIN_SUCCESS_MESSAGES.MACHINE_DELETED);
      } catch (e) {
        console.error("Error deleting machine type:", e);
        notification.showError("Error al eliminar el tipo de máquina.");
      }
    },
    [userId, db, appId, notification]
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
