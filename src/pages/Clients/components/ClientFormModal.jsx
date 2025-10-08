import React, { useState, useEffect } from "react";

/**
 * Modal para crear o editar un cliente
 */
function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  currentClient,
  priceProfiles,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    priceProfileId: "",
  });
  const [error, setError] = useState("");

  // Sincronizar datos del cliente al abrir en modo edición
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && currentClient) {
        setFormData({
          name: currentClient.name || "",
          email: currentClient.email || "",
          phone: currentClient.phone || "",
          priceProfileId: currentClient.priceProfileId || "",
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          priceProfileId: priceProfiles.length > 0 ? priceProfiles[0].id : "",
        });
      }
      setError("");
    }
  }, [isOpen, mode, currentClient, priceProfiles]);

  // Handler del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("El nombre del cliente es obligatorio");
      return;
    }

    if (!formData.priceProfileId) {
      setError("Debe seleccionar un perfil de precios");
      return;
    }

    onSubmit(formData);
  };

  // Cerrar modal y limpiar
  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "", priceProfileId: "" });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "edit" ? "Editar Cliente" : "Nuevo Cliente"}
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

        {/* Mensaje si no hay perfiles */}
        {priceProfiles.length === 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            No hay perfiles de precios disponibles. Crea uno primero en la
            sección de Configuración.
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Campo de email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (opcional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ej: juan@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Campo de teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Ej: +58 412 123 4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Campo de perfil de precios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perfil de Precios <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.priceProfileId}
              onChange={(e) =>
                setFormData({ ...formData, priceProfileId: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={priceProfiles.length === 0}
            >
              {priceProfiles.length === 0 ? (
                <option value="">No hay perfiles disponibles</option>
              ) : (
                <>
                  <option value="">Seleccionar perfil...</option>
                  {priceProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
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
              disabled={priceProfiles.length === 0}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mode === "edit" ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default React.memo(ClientFormModal);
