import React from "react";

/**
 * Tarjeta que muestra la información de un cliente
 */
function ClientCard({ client, profileName, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header con nombre */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {client.name}
          </h3>
          <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            {profileName || "Sin perfil"}
          </div>
        </div>
        <div className="flex gap-2">
          {/* Botón Editar */}
          <button
            onClick={() => onEdit(client)}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Editar cliente"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Botón Eliminar */}
          <button
            onClick={() => onDelete(client)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar cliente"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="space-y-2">
        {/* Email */}
        {client.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">{client.email}</span>
          </div>
        )}

        {/* Teléfono */}
        {client.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="text-sm">{client.phone}</span>
          </div>
        )}

        {/* Mensaje si no hay información de contacto */}
        {!client.email && !client.phone && (
          <p className="text-sm text-gray-400 italic">
            Sin información de contacto
          </p>
        )}
      </div>
    </div>
  );
}

export default React.memo(ClientCard);
