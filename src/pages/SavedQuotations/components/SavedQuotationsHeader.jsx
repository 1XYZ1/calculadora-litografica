import React from "react";

/**
 * Header de la página de cotizaciones guardadas
 */
const SavedQuotationsHeader = ({ totalCount }) => {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-responsive-xl text-gray-800 mb-2">
        Cotizaciones Guardadas
      </h2>
      <p className="text-responsive-base text-gray-600 leading-relaxed">
        Gestiona y edita tus cotizaciones guardadas. Puedes cargar, editar o
        eliminar cotizaciones existentes.
      </p>
      <p className="text-responsive-sm text-gray-500 mt-2">
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
