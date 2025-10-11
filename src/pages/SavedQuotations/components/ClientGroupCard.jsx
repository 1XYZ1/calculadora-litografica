import React, { useState, useId } from "react";
import QuotationCard from "./QuotationCard";

/**
 * ClientGroupCard – Grupo de cotizaciones por cliente con acordeón accesible
 *
 * Props mínimas (compatibles con tu versión):
 * - clientName: string
 * - quotations: Array<{ id, name, clientName, timestamp, grandTotals? }>
 * - totalUSD: number
 * - totalBs: number
 * - count: number
 * - onEdit(quotation), onDelete(id, name)
 *
 * Props opcionales nuevas:
 * - onPreview?(quotation), onDuplicate?(quotation), onShare?(quotation)
 * - currency?: string                        (default: "USD")
 * - showBolivars?: boolean                   (default: true si totalBs > 0)
 */
const ClientGroupCard = ({
  clientName,
  quotations,
  totalUSD,
  totalBs,
  count,
  onEdit,
  onDelete,
  onStatusChange, // Nueva prop para cambio de estado
  onPreview,
  onDuplicate,
  onShare,
  onToggleTemplate,
  onUpdateTemplateName,
  currency = "USD",
  showBolivars,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  const formatMoney = (n, cur = currency) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
    }).format(Number.isFinite(n) ? n : 0);

  const showBs =
    typeof showBolivars === "boolean"
      ? showBolivars
      : Number.isFinite(totalBs) && totalBs > 0;

  const toggleExpanded = () => setIsExpanded((v) => !v);

  return (
    <section
      className="mb-3 sm:mb-4 rounded-2xl border bg-white overflow-hidden transition-all duration-200 hover:shadow-md border-gray-200"
      aria-labelledby={buttonId}
    >
      {/* Header del grupo */}
      <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-blue-50 to-blue-100">
        <div
          className={[
            "grid items-center gap-3",
            // 28px | 1fr | 280px (desktop)
            "md:grid-cols-[28px,1fr,280px]",
          ].join(" ")}
        >
          {/* 1) Toggle acordeón */}
          <div className="hidden md:flex items-center justify-center">
            <button
              id={buttonId}
              aria-controls={panelId}
              aria-expanded={isExpanded}
              onClick={toggleExpanded}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-blue-700 hover:bg-blue-200/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title={isExpanded ? "Colapsar grupo" : "Expandir grupo"}
            >
              <svg
                className={`h-5 w-5 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* 2) Nombre + contador */}
          <button
            onClick={toggleExpanded}
            id={buttonId + "-click"}
            aria-controls={panelId}
            aria-expanded={isExpanded}
            className="text-left min-w-0 group focus:outline-none"
          >
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
              {clientName}
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
              {count} cotización{count !== 1 ? "es" : ""}
            </p>
          </button>

          {/* 3) Totales por cliente (alineado a la derecha) */}
          <div className="md:justify-self-end">
            <div className="text-xs text-gray-600">Total ({currency})</div>
            <div className="text-lg font-semibold text-emerald-700 tabular-nums">
              {formatMoney(totalUSD, currency)}
            </div>
            {showBs && (
              <div className="text-xs text-gray-700">
                Bs:{" "}
                <span className="tabular-nums">
                  {new Intl.NumberFormat(undefined, {
                    maximumFractionDigits: 0,
                  }).format(Number.isFinite(totalBs) ? totalBs : 0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle en móvil (botón grande) */}
        <div className="mt-2 md:hidden">
          <button
            onClick={toggleExpanded}
            aria-controls={panelId}
            aria-expanded={isExpanded}
            className="w-full h-10 rounded-lg border border-blue-200 bg-white/60 text-blue-800 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isExpanded ? "Colapsar" : "Expandir"} grupo
            <svg
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel de cotizaciones */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isExpanded}
      >
        {isExpanded && (
          <div className="p-3 sm:p-4">
            <ul className="space-y-2 sm:space-y-3">
              {quotations.map((quotation) => (
                <QuotationCard
                  key={quotation.id}
                  quotation={quotation}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onPreview={onPreview}
                  onDuplicate={onDuplicate}
                  onShare={onShare}
                  onToggleTemplate={onToggleTemplate}
                  onUpdateTemplateName={onUpdateTemplateName}
                  currency={currency}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

/* ----- Subcomponentes ligeros ----- */

const Badge = ({ children, active = false }) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-2 py-0.5",
      "border text-xs",
      active
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-gray-50 text-gray-700 border-gray-200",
    ].join(" ")}
  >
    {children}
  </span>
);

export default React.memo(ClientGroupCard);
