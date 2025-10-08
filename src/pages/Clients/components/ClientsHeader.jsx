import React from "react";

/**
 * Header de la página de Clientes
 * Diseño responsive con tipografía adaptativa
 */
function ClientsHeader() {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-responsive-xl text-gray-800 mb-2">
        Gestión de Clientes
      </h2>
      <p className="text-responsive-base text-gray-600 leading-relaxed">
        Administra tu lista de clientes y asigna perfiles de precios
        personalizados
      </p>
    </div>
  );
}

export default React.memo(ClientsHeader);
