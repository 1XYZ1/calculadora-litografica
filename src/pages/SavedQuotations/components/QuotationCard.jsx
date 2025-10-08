import React from "react";
import { formatQuotationDate } from "../utils/quotationUtils";
import StatusDropdown from "./StatusDropdown";

/**
 * QuotationCard – fila de “Presupuestos/Cotizaciones”
 * Zonas: [Select] | [Nombre + Cliente + Fecha] | [Totales] | [Estado/Tags] | [Acciones]
 */
const QuotationCard = ({
  quotation,
  onEdit,
  onDelete,
  onStatusChange,
  onPreview,
  onDuplicate,
  onShare,
  selectable = false,
  selected = false,
  onToggleSelect,
  status,
  currency = "USD",
  showBolivars,
  tags = [],
}) => {
  const {
    id,
    name,
    clientName,
    timestamp,
    grandTotals = {},
    status: quotationStatus,
  } = quotation || {};
  const usd = Number(grandTotals.totalGeneral || 0);
  const bs = Number(grandTotals.totalCostInBs || 0);
  const showBs =
    typeof showBolivars === "boolean"
      ? showBolivars
      : Number.isFinite(bs) && bs > 0;

  const formatMoney = (n, cur = "USD") =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
    }).format(Number.isFinite(n) ? n : 0);

  const handleToggleSelect = () => {
    if (selectable && onToggleSelect) onToggleSelect(id);
  };

  return (
    <li
      className={[
        "rounded-2xl border bg-white transition-all duration-200",
        "hover:bg-gray-50 hover:shadow-md",
        selected ? "ring-2 ring-blue-500 ring-offset-0" : "border-gray-200",
      ].join(" ")}
    >
      {/* Grid: en desktop 5 zonas; en móvil apila */}
      <div
        className={[
          "grid items-center gap-4 p-4",
          // columnas de contenido, sin anchos fijos para evitar huecos
          "md:grid-cols-[28px,1fr,auto,auto,auto]",
          "md:gap-x-6",
        ].join(" ")}
      >
        {/* 1) Selección (solo desktop) */}
        <div className="hidden md:flex items-center justify-center">
          {selectable ? (
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={selected}
              onChange={handleToggleSelect}
              aria-label={`Seleccionar cotización ${name || id}`}
            />
          ) : (
            <span
              className="text-gray-300 select-none"
              role="img"
              aria-label="arrastrar"
              title="Arrastrar para reordenar"
            >
              ⋮⋮
            </span>
          )}
        </div>

        {/* 2) Nombre + Cliente + Fecha */}
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-tight truncate">
              {name}
            </h3>
            {status && (
              <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            {clientName && (
              <span className="inline-flex items-center gap-1 text-indigo-700 font-medium truncate">
                <ClientIcon />
                <span className="truncate">{clientName}</span>
              </span>
            )}
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">
              {timestamp ? formatQuotationDate(timestamp) : "Sin fecha"}
            </span>
          </div>

          {!!tags?.length && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* 3) Totales */}
        <div className="md:justify-self-end order-2 md:order-none">
          <div className="text-sm text-gray-500">Total ({currency})</div>
          <div className="text-lg md:text-xl font-semibold text-emerald-600 tabular-nums">
            {formatMoney(usd, currency)}
          </div>
          {showBs && (
            <div className="text-xs text-gray-600">
              Bs: <span className="tabular-nums">{formatNumber(bs)}</span>
            </div>
          )}
        </div>

        {/* 4) Estado + Acciones (móvil: misma fila) */}
        <div className="order-3 md:order-none md:justify-self-start w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Estado */}
            {onStatusChange && (
              <div className="flex-1 md:flex-none [&_*]:cursor-pointer">
                <StatusDropdown
                  className="cursor-pointer w-full md:w-48"
                  currentStatus={quotationStatus || "pending"}
                  quotationId={id}
                  onStatusChange={onStatusChange}
                />
              </div>
            )}

            {/* Acciones - Móvil */}
            <div className="flex items-center justify-end gap-2 md:hidden">
              {onPreview && (
                <IconButton
                  title="Previsualizar"
                  onClick={() => onPreview(quotation)}
                >
                  <PreviewIcon />
                </IconButton>
              )}
              {onDuplicate && (
                <IconButton
                  title="Duplicar"
                  onClick={() => onDuplicate(quotation)}
                >
                  <CopyIcon />
                </IconButton>
              )}
              {onShare && (
                <IconButton
                  title="Compartir"
                  onClick={() => onShare(quotation)}
                >
                  <ShareIcon />
                </IconButton>
              )}
              <IconButton
                title="Editar"
                onClick={() => onEdit(quotation)}
                hover="hover:text-blue-700 hover:bg-blue-50"
              >
                <PencilIcon />
              </IconButton>
              <IconButton
                title="Eliminar"
                onClick={() => onDelete(id, name)}
                hover="hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon />
              </IconButton>
            </div>
          </div>
        </div>

        {/* 5) Acciones - Desktop */}
        <div className="order-4 md:order-none md:justify-self-end hidden md:flex items-center justify-end gap-2">
          {onPreview && (
            <IconButton
              title="Previsualizar"
              onClick={() => onPreview(quotation)}
            >
              <PreviewIcon />
            </IconButton>
          )}
          {onDuplicate && (
            <IconButton title="Duplicar" onClick={() => onDuplicate(quotation)}>
              <CopyIcon />
            </IconButton>
          )}
          {onShare && (
            <IconButton title="Compartir" onClick={() => onShare(quotation)}>
              <ShareIcon />
            </IconButton>
          )}
          <IconButton
            title="Editar"
            onClick={() => onEdit(quotation)}
            hover="hover:text-blue-700 hover:bg-blue-50"
          >
            <PencilIcon />
          </IconButton>
          <IconButton
            title="Eliminar"
            onClick={() => onDelete(id, name)}
            hover="hover:text-red-700 hover:bg-red-50"
          >
            <TrashIcon />
          </IconButton>
        </div>

        {/* Separador móvil */}
        <div className="md:hidden col-span-full border-t border-gray-100 pt-2" />
      </div>
    </li>
  );
};

/* ---------- Subcomponentes & utilidades ---------- */

const Badge = ({ children, tone = "default" }) => {
  const tones = {
    default: "bg-gray-100 text-gray-700",
    info: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    neutral: "bg-slate-50 text-slate-700",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
        "border border-transparent",
        tones[tone] || tones.default,
      ].join(" ")}
    >
      {children}
    </span>
  );
};

const IconButton = ({
  title,
  onClick,
  hover = "hover:text-gray-800 hover:bg-gray-100",
  children,
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className={[
      "p-2.5 rounded-lg transition-transform duration-150",
      "text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      "active:scale-[0.98]",
      hover,
    ].join(" ")}
  >
    {children}
  </button>
);

/* Iconos (outline, 24x24) */
const PencilIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const CopyIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 8h8a2 2 0 012 2v8a2 2 0 01-2 2H10a2 2 0 01-2-2V8z"
    />
  </svg>
);
const ShareIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 8a3 3 0 10-2.83-4H12a3 3 0 102.83 4zM5 12a3 3 0 100 6 3 3 0 000-6zm14 0a3 3 0 100 6 3 3 0 000-6zM8 13l8-5m-8 5l8 5"
    />
  </svg>
);
const PreviewIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553 2.276A2 2 0 0121 14.092V17a2 2 0 01-1.106 1.789L15 21M9 10L4.447 12.276A2 2 0 003 14.092V17a2 2 0 001.106 1.789L9 21m0-11V3m6 7V3"
    />
  </svg>
);
const ClientIcon = () => (
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
);

/* Helpers */
const statusTone = (s) => {
  const m = {
    draft: "neutral",
    sent: "info",
    accepted: "success",
    rejected: "danger",
  };
  return m[(s || "").toLowerCase()] || "default";
};
const statusLabel = (s) => {
  const m = {
    draft: "Borrador",
    sent: "Enviado",
    accepted: "Aceptado",
    rejected: "Rechazado",
  };
  return m[(s || "").toLowerCase()] || s;
};
const formatNumber = (n) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

const formatRelativeDate = (ts) => {
  if (!ts) return "—";
  try {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const then = new Date(ts).getTime();
    const now = Date.now();
    const diffDays = Math.round((then - now) / (1000 * 60 * 60 * 24));
    if (Math.abs(diffDays) >= 7) return new Date(ts).toLocaleDateString();
    return rtf.format(diffDays, "day");
  } catch {
    return new Date(ts).toLocaleDateString();
  }
};

export default React.memo(QuotationCard);
