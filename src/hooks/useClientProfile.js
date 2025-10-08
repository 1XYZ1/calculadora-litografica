import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";

/**
 * Hook para obtener el perfil de precios de un cliente específico
 * Retorna el profileId del cliente
 */
export function useClientProfile(clientId) {
  const { db, appId, userId } = useFirebase();
  const [priceProfileId, setPriceProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay clientId o usuario, resetear
    if (!db || !userId || !clientId) {
      setPriceProfileId(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchClientProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const clientDocRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/clients`,
          clientId
        );

        const clientDoc = await getDoc(clientDocRef);

        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          setPriceProfileId(clientData.priceProfileId || null);
        } else {
          setPriceProfileId(null);
          setError("Cliente no encontrado");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching client profile:", err);
        setError("Error al cargar el perfil del cliente");
        setPriceProfileId(null);
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [db, appId, userId, clientId]);

  return {
    priceProfileId,
    loading,
    error,
  };
}
