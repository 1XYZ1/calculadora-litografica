// src/pages/QuotationDetail/hooks/useQuotationActions.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../../context/FirebaseContext';

/**
 * Hook para acciones CRUD de presupuestos
 * @param {Object} quotation - Datos del presupuesto
 * @returns {Object} { deleteQuotation, updateStatus, duplicateQuotation, editQuotation, isDeleting, error }
 */
export function useQuotationActions(quotation) {
  const navigate = useNavigate();
  const { db, appId, userId } = useFirebase();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Elimina el presupuesto después de confirmación
   */
  const deleteQuotation = async () => {
    if (!quotation?.id) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el presupuesto "${quotation.name}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const quotationRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/quotations/${quotation.id}`
      );
      await deleteDoc(quotationRef);

      // Navegar a la lista de presupuestos después de eliminar
      navigate('/quotations');
    } catch (err) {
      console.error('Error al eliminar presupuesto:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Actualiza el estado del presupuesto
   * @param {string} newStatus - Nuevo estado ('pending', 'sent', 'accepted', 'rejected')
   */
  const updateStatus = async (newStatus) => {
    if (!quotation?.id) return;

    try {
      const quotationRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/quotations/${quotation.id}`
      );
      await updateDoc(quotationRef, {
        status: newStatus,
        lastModified: new Date()
      });
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError(err.message);
    }
  };

  /**
   * Duplica el presupuesto y navega al Calculator
   */
  const duplicateQuotation = () => {
    if (!quotation) return;

    navigate('/calculator', {
      state: {
        duplicateFrom: quotation,
      },
    });
  };

  /**
   * Edita el presupuesto y navega al Calculator
   */
  const editQuotation = () => {
    if (!quotation) return;

    navigate('/calculator', {
      state: {
        quotation,
      },
    });
  };

  return {
    deleteQuotation,
    updateStatus,
    duplicateQuotation,
    editQuotation,
    isDeleting,
    error,
  };
}
