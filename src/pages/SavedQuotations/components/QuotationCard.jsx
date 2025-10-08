import React from "react";
import { formatQuotationDate } from "../utils/quotationUtils";

/**
 * Card individual de cotización con acciones
 */
const QuotationCard = ({ quotation, onEdit, onDelete }) => {
  const { id, name, clientName, timestamp, grandTotals } = quotation;

  return (
    <li className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
        {/* Datos de la cotización */}
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
            {name}
          </p>

          {/* Cliente */}
          {clientName && (
            <div className="flex items-center gap-2 mt-1">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-indigo-600 text-xs sm:text-sm font-medium truncate">
                {clientName}
              </span>
            </div>
          )}

          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {formatQuotationDate(timestamp)}
          </p>

          {/* Totales */}
          {grandTotals && (
            <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="text-gray-700">
                <span className="font-semibold">USD:</span> $
                {(grandTotals.totalGeneral || 0).toFixed(2)}
              </span>
              <span className="text-gray-700">
                <span className="font-semibold">Bs:</span>{" "}
                {(grandTotals.totalCostInBs || 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 flex-shrink-0 w-full lg:w-auto">
          <button
            onClick={() => onEdit(quotation)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm transition-colors flex-1 lg:flex-none min-h-[44px] flex items-center justify-center"
            aria-label={`Editar cotización ${name}`}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(id, name)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm transition-colors flex-1 lg:flex-none min-h-[44px] flex items-center justify-center"
            aria-label={`Eliminar cotización ${name}`}
          >
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );
};

export default React.memo(QuotationCard);
