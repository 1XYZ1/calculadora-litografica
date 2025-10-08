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
    </div>
  );
};

export default React.memo(SavedQuotationsHeader);
