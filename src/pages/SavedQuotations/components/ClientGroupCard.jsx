import React, { useState } from "react";
import QuotationCard from "./QuotationCard";

/**
 * Card de grupo por cliente con accordion colapsable
 */
const ClientGroupCard = ({
  clientName,
  quotations,
  totalUSD,
  totalBs,
  count,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-3 sm:mb-4 border border-gray-300 rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
      {/* Header del grupo con totales */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 p-3 sm:p-4 lg:p-5 transition-colors"
        aria-expanded={isExpanded}
        aria-label={`${
          isExpanded ? "Colapsar" : "Expandir"
        } grupo de ${clientName}`}
      >
        <div className="flex justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Icono de expandir/colapsar */}
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-700 transition-transform flex-shrink-0 ${
                isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>

            <div className="text-left flex-1 min-w-0">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">
                {clientName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {count} cotización{count !== 1 ? "es" : ""}
              </p>
            </div>
          </div>

          {/* Totales por cliente - Desktop */}
          <div className="text-right hidden lg:block flex-shrink-0">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Total USD:</span> $
              {totalUSD.toFixed(2)}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">Total Bs:</span>{" "}
              {totalBs.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Totales en móviles y tablets */}
        <div className="mt-2 lg:hidden">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700">
            <span>
              <span className="font-semibold">USD:</span> ${totalUSD.toFixed(2)}
            </span>
            <span>
              <span className="font-semibold">Bs:</span> {totalBs.toFixed(2)}
            </span>
          </div>
        </div>
      </button>

      {/* Lista de cotizaciones del cliente */}
      {isExpanded && (
        <div className="bg-white p-3 sm:p-4">
          <ul className="space-y-2 sm:space-y-3">
            {quotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(ClientGroupCard);
