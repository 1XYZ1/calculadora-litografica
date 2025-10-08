import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Hook centralizado para manejo de notificaciones tipo Toast
 * Incluye auto-dismiss después de 3 segundos para mensajes de éxito
 */
export function useNotification() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info', 'success', 'error'
  const timeoutRef = useRef(null);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Mostrar mensaje de éxito con auto-dismiss
  const showSuccess = useCallback((msg) => {
    setMessage(msg);
    setMessageType("success");

    // Auto-dismiss después de 3 segundos solo para mensajes de éxito
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setMessage("");
    }, 3000);
  }, []);

  // Mostrar mensaje de error (sin auto-dismiss)
  const showError = useCallback((msg) => {
    setMessage(msg);
    setMessageType("error");

    // Limpiar cualquier timeout previo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Mostrar mensaje informativo (sin auto-dismiss)
  const showInfo = useCallback((msg) => {
    setMessage(msg);
    setMessageType("info");

    // Limpiar cualquier timeout previo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cerrar el mensaje manualmente
  const clearMessage = useCallback(() => {
    setMessage("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    message,
    messageType,
    showSuccess,
    showError,
    showInfo,
    clearMessage,
    // Para compatibilidad
    onClose: clearMessage,
  };
}
