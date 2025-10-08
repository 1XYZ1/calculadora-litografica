import React from "react";

/**
 * Header principal del administrador de precios
 */
function PriceAdminHeader() {
  return (
    <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">
      Administrador de Precios
    </h2>
  );
}

export default React.memo(PriceAdminHeader);
