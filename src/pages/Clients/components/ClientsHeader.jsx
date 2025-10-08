import React from "react";

/**
 * Header de la página de Clientes
 */
function ClientsHeader() {
  return (
    <div className="mb-8">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
        Gestión de Clientes
      </h2>
      <p className="text-gray-600">
        Administra tu lista de clientes y asigna perfiles de precios
        personalizados
      </p>
    </div>
  );
}

export default React.memo(ClientsHeader);
