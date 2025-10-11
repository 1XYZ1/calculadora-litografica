import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";

/**
 * Hook para obtener las cotizaciones de un cliente específico
 * @param {string} clientId - ID del cliente
 */
export function useClientQuotations(clientId) {
  const { db, appId, userId } = useFirebase();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !userId || !clientId) {
      setLoading(false);
      setQuotations([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Referencia a la colección de cotizaciones
    const quotationsRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/quotations`
    );

    // Query filtrado por clientId y ordenado por fecha
    const q = query(
      quotationsRef,
      where("clientId", "==", clientId),
      orderBy("updatedAt", "desc")
    );

    // Listener en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setQuotations(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching client quotations:", err);
        setError("Error al cargar las cotizaciones");
        setLoading(false);
        setQuotations([]);
      }
    );

    return () => unsubscribe();
  }, [db, appId, userId, clientId]);

  return {
    quotations,
    loading,
    error,
  };
}
