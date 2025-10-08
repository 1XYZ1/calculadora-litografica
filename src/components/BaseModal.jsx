import React, { useEffect, useCallback } from "react";

/**
 * Componente base para modales con funcionalidades automáticas:
 * - Bloqueo de scroll del body cuando está abierto
 * - Cierre al hacer click en el backdrop (configurable)
 * - Cierre con tecla ESC (configurable)
 * - Animaciones de entrada/salida
 */
export default function BaseModal({
  isOpen,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  className = "",
  backdropClassName = "",
  size = "default", // 'small', 'default', 'large', 'full'
}) {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!isOpen || !preventBodyScroll) return;

    // Calcular ancho de la scrollbar para evitar saltos
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Guardar estado original
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Aplicar bloqueo de scroll
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add("modal-open");

    // Cleanup: restaurar estado original
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, preventBodyScroll]);

  // Manejar cierre con tecla ESC
  const handleEscapeKey = useCallback(
    (event) => {
      if (event.key === "Escape" && closeOnEscape && isOpen) {
        onClose();
      }
    },
    [closeOnEscape, isOpen, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  // Manejar click en el backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  // No renderizar nada si está cerrado
  if (!isOpen) return null;

  // Determinar tamaño del modal
  const sizeClasses = {
    small: "max-w-md",
    default: "max-w-2xl",
    large: "max-w-4xl",
    full: "max-w-7xl",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm ${backdropClassName}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${className} animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
