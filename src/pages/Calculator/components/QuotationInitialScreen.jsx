import React, { useState, useEffect } from "react";
import { useClients } from "../../../hooks/useClients";

/**
 * Pantalla inicial para configurar el presupuesto antes de entrar al stepper
 * Permite seleccionar cliente y nombre del presupuesto
 */
export default function QuotationInitialScreen({
  mainQuotationName,
  setMainQuotationName,
  clientId,
  setClientId,
  setClientName,
  onBeginQuotation,
  onNavigateToClients,
}) {
  const { clients, loading } = useClients();
  const [selectedClient, setSelectedClient] = useState(null);

  // Sincronizar cliente seleccionado cuando cambia el clientId desde fuera
  useEffect(() => {
    if (clientId && clients.length > 0) {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [clientId, clients]);

  // Manejar cambio de cliente
  const handleClientChange = (e) => {
    const selectedId = e.target.value;

    if (!selectedId) {
      setSelectedClient(null);
      setClientId(null);
      setClientName("");
    } else {
      const client = clients.find((c) => c.id === selectedId);
      if (client) {
        setSelectedClient(client);
        setClientId(client.id);
        setClientName(client.name);
      }
    }

    // Quitar el foco del select después de la selección
    setTimeout(() => {
      e.target.blur();
    }, 100);
  };

  // Verificar si se puede comenzar la cotización
  const canBeginQuotation =
    mainQuotationName.trim() !== "" && clientId !== null;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-8 max-w-2xl w-full">
        {/* Título principal */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-3 sm:mb-4 shadow-lg">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Nueva Cotización
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Completa la información básica para comenzar
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4 sm:space-y-6">
          {/* Campo nombre de presupuesto */}
          <div>
            <label
              htmlFor="quotation-name"
              className="block text-sm sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
            >
              Nombre del Presupuesto
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="quotation-name"
              type="text"
              value={mainQuotationName}
              onChange={(e) => setMainQuotationName(e.target.value)}
              placeholder="Ej: Catálogo Primavera 2024"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Selector de cliente */}
          <div>
            <label
              htmlFor="client-select"
              className="block text-sm sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
            >
              Cliente
              <span className="text-red-500 ml-1">*</span>
            </label>

            {loading ? (
              <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-400">
                Cargando clientes...
              </div>
            ) : clients.length === 0 ? (
              // Mensaje cuando no hay clientes
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-base sm:text-base text-gray-600 font-medium mb-1 sm:mb-2">
                  No hay clientes registrados
                </p>
                <p className="text-sm sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  Debes crear al menos un cliente antes de comenzar una
                  cotización
                </p>
                <button
                  onClick={onNavigateToClients}
                  className="inline-flex items-center px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Crear Cliente
                </button>
              </div>
            ) : (
              // Selector de cliente
              <div className="space-y-2 sm:space-y-3">
                <select
                  id="client-select"
                  value={clientId || ""}
                  onChange={handleClientChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                      {client.company && ` - ${client.company}`}
                    </option>
                  ))}
                </select>

                {/* Botón para crear nuevo cliente */}
                <button
                  onClick={onNavigateToClients}
                  className="text-blue-600 hover:text-blue-700 text-sm sm:text-sm font-medium flex items-center min-h-[44px]"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Crear nuevo cliente
                </button>
              </div>
            )}
          </div>

          {/* Información del cliente seleccionado */}
          {selectedClient && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm sm:text-sm font-medium text-blue-800">
                    {selectedClient.name}
                  </p>
                  {selectedClient.company && (
                    <p className="text-sm sm:text-sm text-blue-600">
                      {selectedClient.company}
                    </p>
                  )}
                  {selectedClient.email && (
                    <p className="text-sm sm:text-sm text-blue-600">
                      {selectedClient.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón comenzar cotización */}
        <div className="mt-6 sm:mt-8">
          <button
            onClick={onBeginQuotation}
            disabled={!canBeginQuotation}
            className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base text-white transition-all shadow-lg min-h-[44px] ${
              canBeginQuotation
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-[1.02] active:scale-100"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {canBeginQuotation
              ? "Comenzar Cotización"
              : "Completa los campos requeridos"}
          </button>
        </div>

        {/* Nota informativa */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-xs text-gray-500">
            Los campos marcados con{" "}
            <span className="text-red-500 font-medium">*</span> son obligatorios
          </p>
        </div>
      </div>
    </div>
  );
}
