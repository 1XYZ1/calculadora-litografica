import React, { useState, useEffect } from "react";
import BaseModal from "../../../components/BaseModal";

/**
 * Modal para crear o editar un perfil de precios
 * Maneja nombre del perfil y duplicación
 */
function ProfileFormModal({ isOpen, onClose, onSubmit, mode, currentName }) {
  const [profileName, setProfileName] = useState("");
  const [error, setError] = useState("");

  // Sincronizar nombre actual al abrir en modo edición
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && currentName) {
        setProfileName(currentName);
      } else if (mode === "duplicate" && currentName) {
        setProfileName(`${currentName} (Copia)`);
      } else {
        setProfileName("");
      }
      setError("");
    }
  }, [isOpen, mode, currentName]);

  // Handler del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!profileName.trim()) {
      setError("El nombre del perfil es obligatorio");
      return;
    }

    onSubmit(profileName.trim());
  };

  // Cerrar modal y limpiar
  const handleClose = () => {
    setProfileName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  // Títulos según el modo
  const titles = {
    create: "Crear Nuevo Perfil",
    edit: "Editar Nombre del Perfil",
    duplicate: "Duplicar Perfil",
  };

  const buttonLabels = {
    create: "Crear Perfil",
    edit: "Guardar Cambios",
    duplicate: "Duplicar Perfil",
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBackdrop={true}
      closeOnEscape={true}
      size="default"
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {titles[mode] || "Perfil"}
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Perfil
          </label>
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Ej: Mayorista, Minorista, VIP..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Mensaje informativo según el modo */}
        {mode === "duplicate" && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            Se duplicará el perfil "{currentName}" con todos sus precios y
            configuraciones.
          </div>
        )}

        {mode === "create" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
            El perfil se creará vacío. Podrás configurar los precios después de
            crearlo.
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            {buttonLabels[mode] || "Guardar"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

export default React.memo(ProfileFormModal);
