import React from "react";

/**
 * Barra de búsqueda con filtrado en tiempo real
 */
const SearchBar = ({ searchQuery, onSearchChange, onClear }) => {
  return (
    <div className="mb-6">
      <label
        htmlFor="search"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Buscar por Cliente:
      </label>
      <div className="relative">
        {/* Icono de búsqueda */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
          placeholder="Buscar por nombre de cliente..."
          className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Buscar cotizaciones por nombre de cliente"
        />

        {/* Botón para limpiar búsqueda */}
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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

      {/* Feedback de búsqueda activa */}
      {searchQuery && (
        <p className="mt-2 text-sm text-blue-600">
          Buscando: &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
