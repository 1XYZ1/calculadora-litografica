import { useState, useCallback } from "react";

/**
 * Hook centralizado para manejo de notificaciones/mensajes modales
 * Reemplaza el estado modalMessage disperso
 */
export function useNotification() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info', 'success', 'error'

  // Mostrar mensaje de éxito
  const showSuccess = useCallback((msg) => {
    setMessage(msg);
    setMessageType("success");
  }, []);

  // Mostrar mensaje de error
  const showError = useCallback((msg) => {
    setMessage(msg);
    setMessageType("error");
  }, []);

  // Mostrar mensaje informativo
  const showInfo = useCallback((msg) => {
    setMessage(msg);
    setMessageType("info");
  }, []);

  // Cerrar el modal/mensaje
  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  return {
    message,
    messageType,
    showSuccess,
    showError,
    showInfo,
    clearMessage,
    // Para compatibilidad con ModalMessage existente
    onClose: clearMessage,
  };
}
