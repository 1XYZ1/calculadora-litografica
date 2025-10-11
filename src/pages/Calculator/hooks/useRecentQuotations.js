/**
 * Hook para obtener las cotizaciones recientes del usuario
 * Devuelve las últimas N cotizaciones ordenadas por fecha de actualización
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../../../context/FirebaseContext';

/**
 * Hook para cargar cotizaciones recientes
 * @param {number} maxResults - Número máximo de cotizaciones a retornar (default: 5)
 * @returns {Object} - { quotations, loading, error }
 */
export function useRecentQuotations(maxResults = 5) {
  const { db, appId, userId } = useFirebase();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay credenciales, resetear estado
    if (!userId || !db || !appId) {
      setQuotations([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Referencia a la colección de cotizaciones del usuario
      const quotationsRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/quotations`
      );

      // Query: últimas N cotizaciones ordenadas por timestamp descendente
      const recentQuery = query(
        quotationsRef,
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );

      // Listener en tiempo real
      const unsubscribe = onSnapshot(
        recentQuery,
        (snapshot) => {
          const recentQuotations = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setQuotations(recentQuotations);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error al cargar cotizaciones recientes:', err);
          setError('No se pudieron cargar las cotizaciones recientes');
          setLoading(false);
          setQuotations([]);
        }
      );

      // Cleanup: cancelar suscripción al desmontar
      return () => unsubscribe();
    } catch (err) {
      console.error('Error configurando listener de cotizaciones recientes:', err);
      setError(err.message);
      setLoading(false);
      setQuotations([]);
    }
  }, [db, appId, userId, maxResults]);

  return {
    quotations,
    loading,
    error,
  };
}
