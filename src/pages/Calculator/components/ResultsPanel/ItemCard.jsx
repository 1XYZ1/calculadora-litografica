import React from "react";

/**
 * ItemCard – fila “tabla-like” con jerarquía clara:
 * [Drag/Select] | [Nombre + metadatos] | [Cantidad] | [Precio unitario] | [Subtotal] | [Acciones]
 *
 * Props esperadas (compatibles con tu versión anterior):
 * - item: {
 *     id, quotationName, totalGeneral, totalPieces,
 *     dimensions?: { width, height },
 *     colors?, paperType?, machineType?, createdAt?
 *   }
 * - onEdit(item), onRemove(id), onShowBreakdown?(item)
 * - Opcionales nuevos:
 *   - onQuantityChange?(id, nextQty)
 *   - onDuplicate?(item)
 *   - selectable?: boolean, selected?: boolean, onToggleSelect?(id)
 */
const ItemCard = ({
  item,
  onEdit,
  onRemove,
  onShowBreakdown,
  onQuantityChange,
  onDuplicate,
  selectable = false,
  selected = false,
  onToggleSelect,
}) => {
  const qty = Number(item?.totalPieces || 0);
  const subtotal = Number(item?.totalGeneral || 0);
  const unit = qty > 0 ? subtotal / qty : 0;

  const formatCurrency = (n) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(Number.isFinite(n) ? n : 0);

  const handleDec = () => {
    if (!onQuantityChange) return;
    const next = Math.max(0, qty - 1);
    onQuantityChange(item.id, next);
  };

  const handleInc = () => {
    if (!onQuantityChange) return;
    const next = qty + 1;
    onQuantityChange(item.id, next);
  };

  const handleToggleSelect = () => {
    if (selectable && onToggleSelect) onToggleSelect(item.id);
  };

  return (
    <li
      className={[
        "rounded-2xl border bg-white transition-all duration-200",
        "hover:bg-gray-50 hover:shadow-md",
        selected ? "ring-2 ring-blue-500 ring-offset-0" : "border-gray-200",
      ].join(" ")}
    >
      {/* Grid principal – desktop en 6 zonas; móvil apila */}
      <div
        className={[
          "grid gap-4 p-4",
          // 24px | 1fr | 160 | 140 | 160 | 120 (aprox)
          "md:grid-cols-[28px,1fr,160px,140px,160px,120px]",
          "items-center",
        ].join(" ")}
      >
        {/* 1) Drag/Select */}
        <div className="hidden md:flex items-center justify-center">
          {selectable ? (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selected}
                onChange={handleToggleSelect}
                aria-label={`Seleccionar ${item.quotationName || "ítem"}`}
              />
            </label>
          ) : (
            <span
              className="text-gray-300 select-none"
              role="img"
              aria-label="arrastrar para reordenar"
              title="Arrastrar para reordenar"
            >
              ⋮⋮
            </span>
          )}
        </div>

        {/* 2) Nombre + metadatos */}
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-tight truncate">
            {item.quotationName}
          </h3>

          <div className="mt-1 flex flex-wrap gap-1.5">
            {!!(item?.dimensions?.width && item?.dimensions?.height) && (
              <Badge dotClass="bg-blue-500">
                {item.dimensions.width} × {item.dimensions.height} cm
              </Badge>
            )}
            {item.colors && (
              <Badge dotClass="bg-purple-500">
                <b className="font-medium">{item.colors}</b> colores
              </Badge>
            )}
            {item.paperType && (
              <Badge dotClass="bg-orange-500">{item.paperType}</Badge>
            )}
            {item.machineType && (
              <Badge dotClass="bg-green-500">{item.machineType}</Badge>
            )}
            {item.createdAt && (
              <Badge dotClass="bg-gray-300">
                {new Date(item.createdAt).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>

        {/* 3) Cantidad (stepper) */}
        <div className="md:justify-self-center">
          {onQuantityChange ? (
            <QuantityStepper
              value={qty}
              onDec={handleDec}
              onInc={handleInc}
              ariaLabel={`Cantidad para ${item.quotationName || "ítem"}`}
            />
          ) : (
            <div className="text-sm text-gray-700">
              <span className="font-medium">{qty}</span> piezas
            </div>
          )}
        </div>

        {/* 4) Precio unitario */}
        <div className="md:justify-self-end text-gray-600">
          <div className="text-sm md:text-base">
            {formatCurrency(unit)}
            <span className="text-gray-500"> / u</span>
          </div>
        </div>

        {/* 5) Subtotal (destacado en verde) */}
        <div className="md:justify-self-end">
          <div className="text-lg md:text-xl font-semibold text-emerald-600 tabular-nums">
            {formatCurrency(subtotal)}
          </div>
        </div>

        {/* 6) Acciones */}
        <div className="md:justify-self-end flex items-center justify-end gap-1">
          {onDuplicate && (
            <IconButton
              title="Duplicar ítem"
              ariaLabel={`Duplicar ${item.quotationName || "ítem"}`}
              onClick={() => onDuplicate(item)}
            >
              {/* Copy icon */}
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
            </IconButton>
          )}

          <IconButton
            title="Editar ítem"
            ariaLabel={`Editar ${item.quotationName || "ítem"}`}
            onClick={() => onEdit(item)}
            hover="hover:text-blue-700 hover:bg-blue-50"
          >
            {/* Pencil */}
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
          </IconButton>

          {onShowBreakdown && (
            <IconButton
              title="Ver desglose de costos"
              ariaLabel={`Desglose de costos para ${
                item.quotationName || "ítem"
              }`}
              onClick={() => onShowBreakdown(item)}
              hover="hover:text-indigo-700 hover:bg-indigo-50"
            >
              {/* Document list */}
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </IconButton>
          )}

          <IconButton
            title="Eliminar ítem"
            ariaLabel={`Eliminar ${item.quotationName || "ítem"}`}
            onClick={() => onRemove(item.id)}
            hover="hover:text-red-700 hover:bg-red-50"
          >
            {/* Trash */}
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
          </IconButton>
        </div>

        {/* Línea extra solo visible en móvil para separar filas */}
        <div className="md:hidden col-span-full border-t border-gray-100 pt-2" />
      </div>
    </li>
  );
};

/** Subcomponentes utilitarios */
const Badge = ({ children, dotClass = "bg-gray-400" }) => (
  <span className="inline-flex items-center gap-1.5 max-w-full rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
    <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
    <span className="truncate">{children}</span>
  </span>
);

const IconButton = ({
  onClick,
  title,
  ariaLabel,
  hover = "hover:text-gray-800 hover:bg-gray-100",
  children,
}) => (
  <button
    onClick={onClick}
    className={[
      "p-2.5 rounded-lg transition-transform duration-150",
      "text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      "active:scale-[0.98]",
      hover,
    ].join(" ")}
    title={title}
    aria-label={ariaLabel || title}
  >
    {children}
  </button>
);

const QuantityStepper = ({ value, onDec, onInc, ariaLabel }) => (
  <div
    className="inline-flex items-center rounded-lg border border-gray-300 bg-white"
    role="group"
    aria-label={ariaLabel}
  >
    <button
      type="button"
      onClick={onDec}
      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-l-lg"
      aria-label="Disminuir cantidad"
    >
      –
    </button>
    <div className="min-w-[3.75rem] text-center px-2 text-sm font-medium text-gray-800 select-none">
      {value}
    </div>
    <button
      type="button"
      onClick={onInc}
      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-r-lg"
      aria-label="Aumentar cantidad"
    >
      +
    </button>
  </div>
);

export default React.memo(ItemCard);
