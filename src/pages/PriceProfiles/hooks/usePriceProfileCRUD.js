import { useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";

/**
 * Hook para operaciones CRUD de perfiles de precios
 * Crear, duplicar, actualizar y eliminar perfiles
 */
export function usePriceProfileCRUD() {
  const { db, appId, userId } = useFirebase();

  // Crear un nuevo perfil vacío
  const createProfile = useCallback(
    async (profileName) => {
      if (!userId || !db) {
        throw new Error("Usuario no autenticado");
      }

      if (!profileName || !profileName.trim()) {
        throw new Error("El nombre del perfil es obligatorio");
      }

      try {
        const profilesCollectionRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles`
        );

        // Verificar si ya existe un perfil con ese nombre
        const q = query(
          profilesCollectionRef,
          where("name", "==", profileName.trim())
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          throw new Error("Ya existe un perfil con ese nombre");
        }

        // Crear el nuevo perfil con estructura vacía
        const profileData = {
          name: profileName.trim(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(profilesCollectionRef, profileData);

        return {
          success: true,
          profileId: docRef.id,
          message: `Perfil "${profileName}" creado exitosamente`,
        };
      } catch (error) {
        console.error("Error creating profile:", error);
        throw error;
      }
    },
    [db, appId, userId]
  );

  // Duplicar un perfil existente
  const duplicateProfile = useCallback(
    async (sourceProfileId, newProfileName) => {
      if (!userId || !db) {
        throw new Error("Usuario no autenticado");
      }

      if (!newProfileName || !newProfileName.trim()) {
        throw new Error("El nombre del nuevo perfil es obligatorio");
      }

      try {
        const profilesCollectionRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles`
        );

        // Verificar que el perfil de origen existe
        const sourceDocRef = doc(profilesCollectionRef, sourceProfileId);
        const sourceDoc = await getDoc(sourceDocRef);

        if (!sourceDoc.exists()) {
          throw new Error("El perfil de origen no existe");
        }

        // Verificar si ya existe un perfil con el nuevo nombre
        const q = query(
          profilesCollectionRef,
          where("name", "==", newProfileName.trim())
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          throw new Error("Ya existe un perfil con ese nombre");
        }

        // Copiar datos del perfil de origen
        const sourceData = sourceDoc.data();
        const newProfileData = {
          ...sourceData,
          name: newProfileName.trim(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(profilesCollectionRef, newProfileData);

        return {
          success: true,
          profileId: docRef.id,
          message: `Perfil "${newProfileName}" duplicado exitosamente`,
        };
      } catch (error) {
        console.error("Error duplicating profile:", error);
        throw error;
      }
    },
    [db, appId, userId]
  );

  // Actualizar nombre de perfil
  const updateProfileName = useCallback(
    async (profileId, newName) => {
      if (!userId || !db) {
        throw new Error("Usuario no autenticado");
      }

      if (!newName || !newName.trim()) {
        throw new Error("El nombre del perfil es obligatorio");
      }

      try {
        const profilesCollectionRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles`
        );

        // Verificar si ya existe otro perfil con ese nombre
        const q = query(
          profilesCollectionRef,
          where("name", "==", newName.trim())
        );
        const snapshot = await getDocs(q);

        // Filtrar el perfil actual de los resultados
        const duplicates = snapshot.docs.filter((doc) => doc.id !== profileId);

        if (duplicates.length > 0) {
          throw new Error("Ya existe un perfil con ese nombre");
        }

        const profileDocRef = doc(profilesCollectionRef, profileId);
        await updateDoc(profileDocRef, {
          name: newName.trim(),
          updatedAt: Timestamp.now(),
        });

        return {
          success: true,
          message: `Perfil actualizado exitosamente`,
        };
      } catch (error) {
        console.error("Error updating profile name:", error);
        throw error;
      }
    },
    [db, appId, userId]
  );

  // Eliminar un perfil
  const deleteProfile = useCallback(
    async (profileId) => {
      if (!userId || !db) {
        throw new Error("Usuario no autenticado");
      }

      try {
        // Verificar si hay clientes asociados a este perfil
        const clientsCollectionRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/clients`
        );
        const q = query(
          clientsCollectionRef,
          where("priceProfileId", "==", profileId)
        );
        const clientsSnapshot = await getDocs(q);

        if (!clientsSnapshot.empty) {
          throw new Error(
            "No se puede eliminar este perfil porque tiene clientes asociados"
          );
        }

        // Eliminar el perfil
        const profileDocRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles`,
          profileId
        );
        await deleteDoc(profileDocRef);

        return {
          success: true,
          message: "Perfil eliminado exitosamente",
        };
      } catch (error) {
        console.error("Error deleting profile:", error);
        throw error;
      }
    },
    [db, appId, userId]
  );

  return {
    createProfile,
    duplicateProfile,
    updateProfileName,
    deleteProfile,
  };
}
