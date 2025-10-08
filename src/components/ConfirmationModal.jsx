import React from "react";

/**
 * Modal de confirmación reutilizable
 * Soporta dos APIs para compatibilidad:
 * 1. API simple: { message, onConfirm, onCancel }
 * 2. API completa: { isOpen, title, message, confirmText, cancelText, onConfirm, onCancel }
 */
export default function ConfirmationModal({
  // API completa (preferida)
  isOpen,
  title,
  message,
  confirmText = "Sí, Eliminar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) {
  // Determinar si debe mostrarse (compatibilidad con ambas APIs)
  const shouldShow = isOpen !== undefined ? isOpen : !!message;

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-fade-in">
        {/* Título (opcional) */}
        {title && (
          <h3 className="text-2xl font-bold mb-4 text-gray-900">{title}</h3>
        )}

        {/* Mensaje */}
        <p className="text-lg mb-6 text-gray-700">{message}</p>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
