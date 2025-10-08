import React from "react";

/**
 * Header principal del gestor de perfiles de precios
 */
function PriceProfileHeader() {
  return (
    <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">
      Configuración de Precios
    </h2>
  );
}

export default React.memo(PriceProfileHeader);
