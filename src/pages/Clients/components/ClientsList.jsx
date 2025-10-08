import React, { useState, useMemo } from "react";
import ClientCard from "./ClientCard";

/**
 * Lista de clientes con búsqueda
 */
function ClientsList({ clients, priceProfiles, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar clientes por término de búsqueda
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    const term = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone?.includes(term)
    );
  }, [clients, searchTerm]);

  // Obtener nombre del perfil
  const getProfileName = (priceProfileId) => {
    const profile = priceProfiles.find((p) => p.id === priceProfileId);
    return profile?.name || "Sin perfil";
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      {clients.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
          )}
        </div>
      )}

      {/* Lista de clientes */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              profileName={getProfileName(client.priceProfileId)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {searchTerm ? (
            <>
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-gray-500">
                No se encontraron clientes que coincidan con "{searchTerm}"
              </p>
            </>
          ) : (
            <>
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-gray-500 text-lg mb-2">
                No hay clientes registrados
              </p>
              <p className="text-gray-400">
                Crea tu primer cliente para comenzar
              </p>
            </>
          )}
        </div>
      )}

      {/* Contador de resultados */}
      {searchTerm && filteredClients.length > 0 && (
        <p className="text-sm text-gray-500 text-center mt-4">
          {filteredClients.length} cliente{filteredClients.length !== 1 && "s"}{" "}
          encontrado{filteredClients.length !== 1 && "s"}
        </p>
      )}
    </div>
  );
}

export default React.memo(ClientsList);
