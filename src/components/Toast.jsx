import React, { useEffect } from "react";

/**
 * Componente Toast para notificaciones no intrusivas
 * Se muestra en la esquina superior derecha y se auto-oculta después de 3 segundos
 *
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje: 'success', 'error', 'info'
 * @param {function} onClose - Función para cerrar el toast
 */
export default function Toast({ message, type = "info", onClose }) {
  // Si no hay mensaje, no renderizar nada
  if (!message) return null;

  // Estilos según el tipo de mensaje
  const typeStyles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-400",
      icon: "text-green-600",
      text: "text-green-800",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-400",
      icon: "text-red-600",
      text: "text-red-800",
      iconPath:
        "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      icon: "text-blue-600",
      text: "text-blue-800",
      iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`${styles.bg} ${styles.border} border-l-4 p-4 rounded-lg shadow-lg max-w-md min-w-[300px] flex items-start gap-3`}
      >
        {/* Icono */}
        <svg
          className={`w-6 h-6 ${styles.icon} flex-shrink-0`}
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
        <p className={`${styles.text} font-medium flex-1 text-sm`}>{message}</p>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className={`${styles.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
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
    </div>
  );
}
