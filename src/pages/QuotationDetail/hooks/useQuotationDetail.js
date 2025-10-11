// src/pages/QuotationDetail/hooks/useQuotationDetail.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../../../context/FirebaseContext';

/**
 * Hook para cargar datos de un presupuesto específico con real-time updates
 * @param {string} quotationId - ID del presupuesto a cargar
 * @returns {Object} { quotation, loading, error }
 */
export function useQuotationDetail(quotationId) {
  const { db, appId, userId } = useFirebase();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quotationId || !db || !userId || !appId) {
      setLoading(false);
      return;
    }

    // Path siguiendo estructura multi-tenant
    const quotationRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/quotations/${quotationId}`
    );

    // Listener en tiempo real para actualizaciones
    const unsubscribe = onSnapshot(
      quotationRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setQuotation({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError('Presupuesto no encontrado');
          setQuotation(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error al cargar presupuesto:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse al desmontar
    return () => unsubscribe();
  }, [quotationId, db, userId, appId]);

  return { quotation, loading, error };
}
