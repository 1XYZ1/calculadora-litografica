import React from "react";
import { formatQuotationDate } from "../utils/quotationUtils";

/**
 * Card individual de cotización con checkbox y acciones
 */
const QuotationCard = ({
  quotation,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}) => {
  const { id, name, clientName, timestamp, grandTotals } = quotation;

  return (
    <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Checkbox y datos de la cotización */}
        <div className="flex items-center flex-1 min-w-0 gap-3">
          <input
            type="checkbox"
            className="h-5 w-5 text-blue-600 rounded cursor-pointer flex-shrink-0"
            checked={isSelected}
            onChange={() => onToggleSelect(id)}
            aria-label={`Seleccionar cotización ${name}`}
          />

          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 break-words">
              {name}
            </p>

            {/* Cliente */}
            {clientName && (
              <div className="flex items-center gap-2 mt-1">
                <svg
                  className="w-4 h-4 text-gray-400"
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
                <span className="text-indigo-600 text-sm font-medium">
                  {clientName}
                </span>
              </div>
            )}

            <p className="text-gray-500 text-sm mt-1">
              {formatQuotationDate(timestamp)}
            </p>

            {/* Totales */}
            {grandTotals && (
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="text-gray-700">
                  <span className="font-semibold">Total USD:</span> $
                  {(grandTotals.totalGeneral || 0).toFixed(2)}
                </span>
                <span className="text-gray-700">
                  <span className="font-semibold">Total Bs:</span>{" "}
                  {(grandTotals.totalCostInBs || 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(quotation)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
            aria-label={`Editar cotización ${name}`}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(id, name)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
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
