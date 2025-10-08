import React from "react";

/**
 * Header de la página de cotizaciones guardadas
 */
const SavedQuotationsHeader = ({ totalCount }) => {
  return (
    <div className="mb-8">
      <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-2">
        Cotizaciones Guardadas
      </h2>
      <p className="text-center text-gray-600">
        {totalCount === 0
          ? "No hay cotizaciones"
          : `${totalCount} cotización${
              totalCount !== 1 ? "es" : ""
            } encontrada${totalCount !== 1 ? "s" : ""}`}
      </p>
    </div>
  );
};

export default React.memo(SavedQuotationsHeader);
