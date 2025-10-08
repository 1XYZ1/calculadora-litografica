import React from "react";

/**
 * Estado vacío cuando no hay cotizaciones o sin resultados de filtros
 */
const EmptyState = ({ isFiltered }) => {
  if (isFiltered) {
    return (
      <div className="text-center py-16 px-4">
        <svg
          className="mx-auto h-24 w-24 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No se encontraron cotizaciones
        </h3>
        <p className="text-gray-500 mb-4">
          No hay cotizaciones que coincidan con los filtros aplicados
        </p>
        <p className="text-sm text-gray-400">
          Intenta ajustar los filtros para encontrar más resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-4">
      <svg
        className="mx-auto h-24 w-24 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No hay cotizaciones guardadas
      </h3>
      <p className="text-gray-500">
        Las cotizaciones que guardes aparecerán aquí para que puedas editarlas o
        consultarlas más tarde.
      </p>
    </div>
  );
};

export default React.memo(EmptyState);
