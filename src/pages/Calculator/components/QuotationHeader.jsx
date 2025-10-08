import React from "react";

/**
 * Componente para el header con nombre de presupuesto y cliente
 */
const QuotationHeader = ({
  mainQuotationName,
  setMainQuotationName,
  clientName,
  setClientName,
  isEditing,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="mainQuotationName"
        >
          Nombre del Presupuesto
        </label>
        <input
          id="mainQuotationName"
          type="text"
          value={mainQuotationName}
          onChange={(e) => setMainQuotationName(e.target.value)}
          className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
          placeholder="Ej. Papelería Corporativa"
        />
      </div>
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="clientName"
        >
          Nombre del Cliente
        </label>
        <input
          id="clientName"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
          placeholder="Ej. DIALCA"
        />
      </div>
    </div>
  );
};

export default React.memo(QuotationHeader);
