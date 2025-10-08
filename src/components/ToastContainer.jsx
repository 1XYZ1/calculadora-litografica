import React from "react";

/**
 * Contenedor de notificaciones Toast
 * Reemplaza el sistema de modales ModalMessage
 */
export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

/**
 * Componente individual de Toast
 */
function Toast({ toast, onRemove }) {
  const { id, message, type } = toast;

  // Estilos según el tipo
  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 border-green-400",
          icon: "text-green-500",
          text: "text-green-800",
          iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        };
      case "error":
        return {
          bg: "bg-red-50 border-red-400",
          icon: "text-red-500",
          text: "text-red-800",
          iconPath:
            "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-400",
          icon: "text-yellow-500",
          text: "text-yellow-800",
          iconPath:
            "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50 border-blue-400",
          icon: "text-blue-500",
          text: "text-blue-800",
          iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg
        ${styles.bg}
        animate-in slide-in-from-right-5 fade-in duration-300
      `}
      role="alert"
    >
      {/* Icono */}
      <svg
        className={`w-6 h-6 flex-shrink-0 ${styles.icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={styles.iconPath}
        />
      </svg>

      {/* Mensaje */}
      <div className="flex-1">
        <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={() => onRemove(id)}
        className={`flex-shrink-0 ml-2 hover:opacity-70 transition-opacity ${styles.icon}`}
        aria-label="Cerrar notificación"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
