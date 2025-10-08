import { useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Hook para cambiar el estado de una cotización en Firestore
 * Actualiza el campo 'status' de la cotización especificada
 */
export const useStatusChange = ({ db, appId, userId, onSuccess, onError }) => {
  const changeStatus = useCallback(
    async (quotationId, newStatus) => {
      try {
        const quotationDocRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/quotations`,
          quotationId
        );

        await updateDoc(quotationDocRef, {
          status: newStatus,
        });

        onSuccess?.(`Estado actualizado a "${newStatus}"`);
      } catch (error) {
        console.error("Error updating quotation status:", error);
        onError?.("Error al actualizar el estado de la cotización");
      }
    },
    [db, appId, userId, onSuccess, onError]
  );

  return { changeStatus };
};
