import { useState, useCallback } from "react";

/**
 * Hook para gestionar notificaciones Toast
 * Reemplaza el sistema de modales ModalMessage
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  // Generar ID único para cada toast
  const generateId = () => `toast-${Date.now()}-${Math.random()}`;

  // Mostrar un toast
  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = generateId();

    const toast = {
      id,
      message,
      type, // 'success', 'error', 'info', 'warning'
      duration,
      timestamp: Date.now(),
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss después del duration especificado
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  // Mostrar toast de éxito
  const success = useCallback(
    (message, duration = 4000) => {
      return showToast(message, "success", duration);
    },
    [showToast]
  );

  // Mostrar toast de error
  const error = useCallback(
    (message, duration = 5000) => {
      return showToast(message, "error", duration);
    },
    [showToast]
  );

  // Mostrar toast de información
  const info = useCallback(
    (message, duration = 4000) => {
      return showToast(message, "info", duration);
    },
    [showToast]
  );

  // Mostrar toast de advertencia
  const warning = useCallback(
    (message, duration = 4000) => {
      return showToast(message, "warning", duration);
    },
    [showToast]
  );

  // Remover un toast específico
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Limpiar todos los toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    success,
    error,
    info,
    warning,
    removeToast,
    clearAll,
  };
}
