import React from "react";

/**
 * Componente para seleccionar y gestionar perfiles de precios
 * Incluye dropdown de selección y botones de acción
 */
function ProfileSelector({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onCreateProfile,
  onDuplicateProfile,
  onEditProfile,
  onDeleteProfile,
  loading,
}) {
  // Encontrar el perfil seleccionado
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-responsive rounded-xl shadow-md border border-indigo-100 mb-8">
      <div className="flex flex-col gap-4">
        {/* Selector de perfil */}
        <div className="w-full">
          <label className="block label-responsive text-gray-700 mb-2">
            Perfil de Precios Activo
          </label>
          <div className="relative">
            <select
              value={selectedProfileId || ""}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="w-full appearance-none min-h-[44px] px-4 pr-10 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
              disabled={loading || profiles.length === 0}
            >
              {profiles.length === 0 ? (
                <option value="">No hay perfiles creados</option>
              ) : (
                <>
                  <option value="">Seleccionar perfil...</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Botones de acción - Grid responsive */}
        <div className="grid-responsive-4 gap-2">
          {/* Botón Nuevo Perfil */}
          <button
            onClick={onCreateProfile}
            className="btn-primary bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm flex items-center justify-center gap-2"
            disabled={loading}
            title="Crear nuevo perfil"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Nuevo</span>
          </button>

          {/* Botón Duplicar - solo si hay perfil seleccionado */}
          {selectedProfileId && (
            <button
              onClick={onDuplicateProfile}
              className="btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center justify-center gap-2"
              disabled={loading}
              title="Duplicar perfil actual"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Duplicar</span>
            </button>
          )}

          {/* Botón Editar - solo si hay perfil seleccionado */}
          {selectedProfileId && (
            <button
              onClick={onEditProfile}
              className="btn-primary bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm flex items-center justify-center gap-2"
              disabled={loading}
              title="Cambiar nombre del perfil"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Editar</span>
            </button>
          )}

          {/* Botón Eliminar - solo si hay perfil seleccionado */}
          {selectedProfileId && (
            <button
              onClick={onDeleteProfile}
              className="btn-primary bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm flex items-center justify-center gap-2"
              disabled={loading}
              title="Eliminar perfil actual"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Borrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mensaje si no hay perfiles */}
      {profiles.length === 0 && (
        <div className="mt-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
          No hay perfiles de precios creados. Crea uno para comenzar.
        </div>
      )}

      {/* Mensaje si no hay perfil seleccionado */}
      {profiles.length > 0 && !selectedProfileId && (
        <div className="mt-4 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
          Selecciona un perfil para editar sus precios.
        </div>
      )}
    </div>
  );
}

export default React.memo(ProfileSelector);
