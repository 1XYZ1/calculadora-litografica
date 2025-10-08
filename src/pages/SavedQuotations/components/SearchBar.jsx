import React from "react";

/**
 * Barra de filtros
 * Permite filtrar por cliente
 */
const SearchBar = ({ selectedClientId, onClientFilterChange, clients }) => {
  return (
    <div className="mb-4 sm:mb-6">
      {/* Filtro por cliente */}
      <div>
        <label
          htmlFor="clientFilter"
          className="block text-gray-700 text-md font-bold mb-2"
        >
          Filtrar por Cliente:
        </label>
        <select
          id="clientFilter"
          value={selectedClientId || ""}
          onChange={(e) => onClientFilterChange(e.target.value)}
          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base cursor-pointer hover:border-gray-400 transition-colors"
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
      {selectedClientId && (
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
            Cliente:{" "}
            {clients.find((c) => c.id === selectedClientId)?.name || "N/A"}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
