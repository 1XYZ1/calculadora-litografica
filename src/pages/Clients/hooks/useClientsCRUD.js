import { useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";

/**
 * Hook para operaciones CRUD de clientes
 * Crear, actualizar y eliminar clientes
 */
export function useClientsCRUD() {
  const { db, appId, userId } = useFirebase();

  // Validar email
  const validateEmail = (email) => {
    if (!email) return true; // Email es opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Crear un nuevo cliente
  const createClient = useCallback(
    async (clientData) => {
      if (!userId || !db) {
        throw new Error("Usuario no autenticado");
      }

      const { name, email, phone, priceProfileId } = clientData;

      // Validaciones
      if (!name || !name.trim()) {
        throw new Error("El nombre del cliente es obligatorio");
      }

      if (!priceProfileId) {
        throw new Error("Debe seleccionar un perfil de precios");
      }

      if (email && !validateEmail(email)) {
        throw new Error("El formato del email no es válido");
      }

      try {
        const clientsCollectionRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/clients`
        );

        const newClient = {
          name: name.trim(),
          email: email?.trim() || "",
          phone: phone?.trim() || "",
          priceProfileId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(clientsCollectionRef, newClient);

        return {
          success: true,
          clientId: docRef.id,
          message: `Cliente "${name}" creado exitosamente`,
        };
      } catch (error) {
        console.error("Error creating client:", error);
        throw error;
      }
    },
    [db, appId, userId]
  );

  // Actualizar un cliente existente
  const updateClient = useCallback(
    async (clientId, clientData) => {
      if (!userId || !db) {
        throw new Error("Usuario no autenticado");
      }

      const { name, email, phone, priceProfileId } = clientData;

      // Validaciones
      if (!name || !name.trim()) {
        throw new Error("El nombre del cliente es obligatorio");
      }

      if (!priceProfileId) {
        throw new Error("Debe seleccionar un perfil de precios");
      }

      if (email && !validateEmail(email)) {
        throw new Error("El formato del email no es válido");
      }

      try {
        const clientDocRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/clients`,
          clientId
        );

        const updatedClient = {
          name: name.trim(),
          email: email?.trim() || "",
          phone: phone?.trim() || "",
          priceProfileId,
          updatedAt: Timestamp.now(),
        };

        await updateDoc(clientDocRef, updatedClient);

        return {
          success: true,
          message: `Cliente "${name}" actualizado exitosamente`,
        };
      } catch (error) {
        console.error("Error updating client:", error);
        throw error;
      }
    },
    [db, appId, userId]
  );

  // Eliminar un cliente
  const deleteClient = useCallback(
    async (clientId) => {
      if (!userId || !db) {
        throw new Error("Usuario no autenticado");
      }

      try {
        // Verificar si hay cotizaciones asociadas a este cliente
        const quotationsCollectionRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/quotations`
        );
        const q = query(
          quotationsCollectionRef,
          where("clientId", "==", clientId)
        );
        const quotationsSnapshot = await getDocs(q);

        if (!quotationsSnapshot.empty) {
          throw new Error(
            "No se puede eliminar este cliente porque tiene cotizaciones asociadas"
          );
        }

        // Eliminar el cliente
        const clientDocRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/clients`,
          clientId
        );
        await deleteDoc(clientDocRef);

        return {
          success: true,
          message: "Cliente eliminado exitosamente",
        };
      } catch (error) {
        console.error("Error deleting client:", error);
        throw error;
      }
    },
    [db, appId, userId]
  );

  return {
    createClient,
    updateClient,
    deleteClient,
  };
}
