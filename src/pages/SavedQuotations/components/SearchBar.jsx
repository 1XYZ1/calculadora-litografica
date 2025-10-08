import React from "react";

/**
 * Barra de búsqueda y filtros
 * Permite buscar por texto y filtrar por cliente
 */
const SearchBar = ({
  searchQuery,
  onSearchChange,
  onClear,
  selectedClientId,
  onClientFilterChange,
  clients,
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Búsqueda por texto */}
      <div>
        <label
          htmlFor="search"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Buscar:
        </label>
        <div className="relative">
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
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

          {/* Input de búsqueda */}
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre de cotización o cliente..."
            className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Botón para limpiar búsqueda */}
          {searchQuery && (
            <button
              onClick={onClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
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
          )}
        </div>
      </div>

      {/* Filtro por cliente */}
      <div>
        <label
          htmlFor="clientFilter"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Filtrar por Cliente:
        </label>
        <select
          id="clientFilter"
          value={selectedClientId || ""}
          onChange={(e) => onClientFilterChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los clientes</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback de filtros activos */}
      {(searchQuery || selectedClientId) && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              Búsqueda: &quot;{searchQuery}&quot;
            </span>
          )}
          {selectedClientId && (
            <span className="inline-flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              Cliente:{" "}
              {clients.find((c) => c.id === selectedClientId)?.name || "N/A"}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
