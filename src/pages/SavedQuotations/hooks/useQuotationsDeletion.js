import { useState, useCallback } from "react";
import { collection, deleteDoc, doc } from "firebase/firestore";

/**
 * Hook para gestionar la eliminación de cotizaciones
 */
export const useQuotationsDeletion = ({
  db,
  appId,
  userId,
  selectedQuotations,
  deselectAll,
  onSuccess,
  onError,
}) => {
  const [confirmModalState, setConfirmModalState] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Obtener referencia a la colección
  const quotationsCollectionRef = useCallback(() => {
    if (db && appId && userId) {
      return collection(db, `artifacts/${appId}/users/${userId}/quotations`);
    }
    return null;
  }, [db, appId, userId]);

  // Confirmar eliminación de una sola cotización
  const confirmDeleteSingle = useCallback((id, name) => {
    setConfirmModalState({
      type: "single",
      data: { id, name },
      message: `¿Seguro que quieres eliminar "${name}"?`,
    });
  }, []);

  // Confirmar eliminación múltiple
  const confirmDeleteMultiple = useCallback(() => {
    if (selectedQuotations.length === 0) {
      if (onError) {
        onError("No hay cotizaciones seleccionadas.");
      }
      return;
    }

    setConfirmModalState({
      type: "multiple",
      data: selectedQuotations,
      message: `¿Seguro que quieres eliminar ${selectedQuotations.length} cotización(es)?`,
    });
  }, [selectedQuotations, onError]);

  // Ejecutar eliminación
  const executeDelete = useCallback(async () => {
    if (!userId) {
      if (onError) {
        onError("Debe estar autenticado para realizar esta acción.");
      }
      setConfirmModalState(null);
      return;
    }

    const currentRef = quotationsCollectionRef();

    if (!currentRef) {
      if (onError) {
        onError("Error de inicialización.");
      }
      setConfirmModalState(null);
      return;
    }

    // Determinar IDs a eliminar
    const idsToDelete =
      confirmModalState.type === "single"
        ? [confirmModalState.data.id]
        : confirmModalState.data;

    setIsDeleting(true);
    setConfirmModalState(null);

    try {
      // Eliminar todas las cotizaciones con Promise.allSettled
      const promises = idsToDelete.map((id) => deleteDoc(doc(currentRef, id)));
      const results = await Promise.allSettled(promises);

      const successCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failureCount = idsToDelete.length - successCount;

      // Deseleccionar todo después de eliminar
      if (deselectAll) {
        deselectAll();
      }

      // Mensajes de éxito/error
      if (successCount > 0 && onSuccess) {
        onSuccess(
          `Se eliminaron ${successCount} cotización(es) correctamente.`
        );
      }

      if (failureCount > 0 && onError) {
        onError(`Error al eliminar ${failureCount} cotización(es).`);
      }
    } catch (err) {
      console.error("Error deleting quotations:", err);
      if (onError) {
        onError("Error al eliminar las cotizaciones.");
      }
    } finally {
      setIsDeleting(false);
    }
  }, [
    userId,
    confirmModalState,
    quotationsCollectionRef,
    deselectAll,
    onSuccess,
    onError,
  ]);

  // Cancelar eliminación
  const cancelDelete = useCallback(() => {
    setConfirmModalState(null);
  }, []);

  return {
    confirmDeleteSingle,
    confirmDeleteMultiple,
    executeDelete,
    cancelDelete,
    confirmModalState,
    setConfirmModalState,
    isDeleting,
  };
};
