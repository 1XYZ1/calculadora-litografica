import { useState, useCallback } from "react";

/**
 * Hook para gestionar notificaciones/mensajes modales
 */
export const useNotification = () => {
  const [message, setMessage] = useState("");

  const showSuccess = useCallback((msg) => {
    setMessage(msg);
  }, []);

  const showError = useCallback((msg) => {
    setMessage(msg);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  return {
    message,
    setMessage,
    showSuccess,
    showError,
    clearMessage,
  };
};
