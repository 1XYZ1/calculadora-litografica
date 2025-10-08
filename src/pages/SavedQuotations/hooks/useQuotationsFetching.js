import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

/**
 * Hook para cargar cotizaciones desde Firestore en tiempo real
 */
export const useQuotationsFetching = ({ db, appId, userId }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener referencia a la colección de cotizaciones
  const quotationsCollectionRef = useCallback(() => {
    if (db && appId && userId) {
      return collection(db, `artifacts/${appId}/users/${userId}/quotations`);
    }
    return null;
  }, [db, appId, userId]);

  useEffect(() => {
    // Si no hay usuario, resetear estado
    if (!userId) {
      setLoading(false);
      setQuotations([]);
      setError(null);
      return;
    }

    const currentCollectionRef = quotationsCollectionRef();

    if (!currentCollectionRef) {
      setLoading(false);
      setQuotations([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Crear query ordenada por timestamp descendente
    const q = query(currentCollectionRef, orderBy("timestamp", "desc"));

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
        console.error("Error fetching quotations:", err);
        setError("Error al cargar las cotizaciones guardadas.");
        setLoading(false);
        setQuotations([]);
      }
    );

    // Cleanup: cancelar suscripción al desmontar
    return () => unsubscribe();
  }, [quotationsCollectionRef, userId]);

  return {
    quotations,
    loading,
    error,
  };
};
