import React, { useState, useEffect } from "react";
import BaseModal from "../../../components/BaseModal";

/**
 * Modal para confirmar duplicación de cotización
 * Permite cambiar cliente y renombrar la cotización
 */
export default function DuplicateQuotationModal({
  isOpen,
  onClose,
  onConfirm,
  quotation,
  clients = [],
}) {
  const [newName, setNewName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [keepOriginalClient, setKeepOriginalClient] = useState(true);

  // Sincronizar nombre cuando se abre el modal
  useEffect(() => {
    if (isOpen && quotation) {
      setNewName(`${quotation.name} (Copia)`);
      setSelectedClientId(quotation.clientId || "");
      setKeepOriginalClient(true);
    }
  }, [isOpen, quotation]);

  const handleConfirm = () => {
    const clientId = keepOriginalClient ? quotation.clientId : selectedClientId;
    const clientName = keepOriginalClient
      ? quotation.clientName
      : clients.find(c => c.id === clientId)?.name || "";

    onConfirm({
      newName: newName.trim(),
      clientId,
      clientName,
    });
  };

  const canConfirm = newName.trim() !== "" && (keepOriginalClient || selectedClientId !== "");

  if (!quotation) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop={true}
      closeOnEscape={true}
      size="default"
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Duplicar Cotización
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Crea una copia de "{quotation.name}"
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Información de la cotización original */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          Cotización Original:
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Nombre: {quotation.name}</p>
          <p>• Cliente: {quotation.clientName}</p>
          <p>• Ítems: {quotation.items?.length || 0}</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-5">
        {/* Campo de nuevo nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la nueva cotización <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Proyecto XYZ (Copia)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Opción de cambiar cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cliente de la nueva cotización
          </label>

          <div className="space-y-3">
            {/* Opción: Mantener cliente original */}
            <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="client-option"
                checked={keepOriginalClient}
                onChange={() => setKeepOriginalClient(true)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Mantener cliente original
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cliente: {quotation.clientName}
                </p>
              </div>
            </label>

            {/* Opción: Seleccionar otro cliente */}
            <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="client-option"
                checked={!keepOriginalClient}
                onChange={() => setKeepOriginalClient(false)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Seleccionar otro cliente
                </p>
                {!keepOriginalClient && (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex gap-2">
          <svg
            className="w-5 h-5 text-yellow-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-yellow-800">
            Se duplicarán todos los ítems con sus configuraciones. La nueva cotización
            se guardará como borrador.
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Duplicar Cotización
        </button>
      </div>
    </BaseModal>
  );
}
