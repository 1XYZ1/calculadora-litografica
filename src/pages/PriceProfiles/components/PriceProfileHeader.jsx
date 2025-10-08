import React from "react";

/**
 * Header principal del gestor de perfiles de precios
 */
function PriceProfileHeader() {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-responsive-xl text-gray-800 mb-2">
        Configuración de Precios
      </h2>
      <p className="text-responsive-base text-gray-600 leading-relaxed">
        Gestiona los precios de materiales, equipos y acabados para crear
        perfiles personalizados por cliente
      </p>
    </div>
  );
}

export default React.memo(PriceProfileHeader);
