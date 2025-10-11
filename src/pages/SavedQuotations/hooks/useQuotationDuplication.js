import { useState, useCallback } from "react";
import { collection, addDoc, Timestamp, doc, updateDoc, increment } from "firebase/firestore";

/**
 * Hook para manejar la duplicación de cotizaciones
 * Crea una nueva cotización basada en una existente
 */
export function useQuotationDuplication({ db, appId, userId, onSuccess, onError }) {
  const [duplicating, setDuplicating] = useState(false);
  const [modalState, setModalState] = useState(null);

  /**
   * Abre el modal de confirmación para duplicar
   */
  const confirmDuplicate = useCallback((quotation) => {
    setModalState({ quotation });
  }, []);

  /**
   * Cierra el modal de duplicación
   */
  const cancelDuplicate = useCallback(() => {
    setModalState(null);
  }, []);

  /**
   * Ejecuta la duplicación de la cotización
   */
  const executeDuplicate = useCallback(
    async ({ newName, clientId, clientName }) => {
      if (!modalState || !modalState.quotation) return;

      const originalQuotation = modalState.quotation;

      setDuplicating(true);
      try {
        const quotationsCollectionRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/quotations`
        );

        // Crear nueva cotización duplicada
        const newQuotation = {
          name: newName,
          clientId,
          clientName,
          items: originalQuotation.items || [],
          grandTotals: originalQuotation.grandTotals || {},
          status: "draft", // Siempre empieza como borrador
          timestamp: Timestamp.now(),
          updatedAt: Timestamp.now(),
          // Campos para tracking de duplicación
          duplicatedFrom: originalQuotation.id,
          createdVia: originalQuotation.isTemplate ? "template" : "duplicate",
          isTemplate: false,
          usageCount: 0,
        };

        await addDoc(quotationsCollectionRef, newQuotation);

        // Si la cotización original es una plantilla, incrementar su contador de uso
        if (originalQuotation.isTemplate && originalQuotation.id) {
          const templateRef = doc(
            db,
            `artifacts/${appId}/users/${userId}/quotations`,
            originalQuotation.id
          );
          await updateDoc(templateRef, {
            usageCount: increment(1),
            updatedAt: Timestamp.now(),
          });
        }

        setModalState(null);

        if (onSuccess) {
          onSuccess(`Cotización "${newName}" duplicada exitosamente`);
        }
      } catch (error) {
        console.error("Error duplicating quotation:", error);
        if (onError) {
          onError("Error al duplicar la cotización");
        }
      } finally {
        setDuplicating(false);
      }
    },
    [db, appId, userId, modalState, onSuccess, onError]
  );

  return {
    confirmDuplicate,
    cancelDuplicate,
    executeDuplicate,
    duplicating,
    modalState,
  };
}
