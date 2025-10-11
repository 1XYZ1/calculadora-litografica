import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";

/**
 * Hook para obtener y gestionar los detalles de un cliente específico
 * @param {string} clientId - ID del cliente
 */
export function useClientDetail(clientId) {
  const { db, appId, userId } = useFirebase();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar datos del cliente
  useEffect(() => {
    if (!db || !userId || !clientId) {
      setLoading(false);
      setClient(null);
      setError(null);
      return;
    }

    const loadClient = async () => {
      setLoading(true);
      setError(null);

      try {
        const clientDocRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/clients/${clientId}`
        );
        const clientDoc = await getDoc(clientDocRef);

        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() });
        } else {
          setError("Cliente no encontrado");
          setClient(null);
        }
      } catch (err) {
        console.error("Error loading client:", err);
        setError("Error al cargar el cliente");
        setClient(null);
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [db, appId, userId, clientId]);

  // Función para actualizar el cliente
  const updateClient = async (updates) => {
    if (!db || !userId || !clientId) {
      return { success: false, error: "Datos insuficientes" };
    }

    setSaving(true);
    try {
      const clientDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/clients/${clientId}`
      );

      await updateDoc(clientDocRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      // Actualizar estado local
      setClient((prev) => ({ ...prev, ...updates }));
      setSaving(false);
      return { success: true };
    } catch (err) {
      console.error("Error updating client:", err);
      setSaving(false);
      return { success: false, error: "Error al actualizar el cliente" };
    }
  };

  return {
    client,
    loading,
    error,
    saving,
    updateClient,
  };
}
