import React from "react";

/**
 * Componente para el header con nombre de presupuesto y selector de cliente
 */
const QuotationHeader = ({
  mainQuotationName,
  setMainQuotationName,
  clientId,
  setClientId,
  setClientName,
  clients,
  isEditing,
}) => {
  // Handler para cuando se selecciona un cliente
  const handleClientChange = (e) => {
    const selectedClientId = e.target.value;
    setClientId(selectedClientId);

    // Actualizar también el nombre del cliente para guardarlo en la cotización
    if (selectedClientId) {
      const selectedClient = clients.find((c) => c.id === selectedClientId);
      setClientName(selectedClient?.name || "");
    } else {
      setClientName("");
    }
  };

  return (
    <div className="grid-responsive-2 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-2xl mx-auto">
      <div>
        <label
          className="block text-gray-700 label-responsive mb-1.5 sm:mb-2"
          htmlFor="mainQuotationName"
        >
          Nombre del Presupuesto
        </label>
        <input
          id="mainQuotationName"
          type="text"
          value={mainQuotationName}
          onChange={(e) => setMainQuotationName(e.target.value)}
          className="shadow appearance-none border rounded-lg w-full min-h-[44px] px-3 sm:px-4 text-responsive-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Ej. Papelería Corporativa"
        />
      </div>
      <div>
        <label
          className="block text-gray-700 label-responsive mb-1.5 sm:mb-2"
          htmlFor="clientSelect"
        >
          Cliente <span className="text-red-500">*</span>
        </label>
        <select
          id="clientSelect"
          value={clientId || ""}
          onChange={handleClientChange}
          className="shadow appearance-none border rounded-lg w-full min-h-[44px] px-3 sm:px-4 text-responsive-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={clients.length === 0}
        >
          {clients.length === 0 ? (
            <option value="">No hay clientes creados</option>
          ) : (
            <>
              <option value="">Seleccionar cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </>
          )}
        </select>
        {clients.length === 0 && (
          <p className="text-amber-600 text-xs sm:text-sm mt-1">
            Crea un cliente primero en la sección Clientes
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(QuotationHeader);
