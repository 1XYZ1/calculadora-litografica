import React from "react";

/**
 * Sección de filtros de fecha con opción de limpiar
 */
const DateFiltersSection = ({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClear,
}) => {
  const hasDateFilters = startDate || endDate;

  return (
    <section className="bg-blue-50 p-6 rounded-xl shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-blue-700">Filtrar por Fecha</h3>

        {/* Botón para limpiar filtros de fecha */}
        {hasDateFilters && (
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
            aria-label="Limpiar filtros de fecha"
          >
            Limpiar fechas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha de inicio */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Fecha de Inicio:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Seleccionar fecha de inicio"
          />
        </div>

        {/* Fecha de fin */}
        <div>
          <label
            htmlFor="endDate"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Fecha de Fin:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Seleccionar fecha de fin"
          />
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasDateFilters && (
        <div className="mt-4 text-sm text-blue-700">
          {startDate && endDate ? (
            <p>
              Mostrando cotizaciones desde <strong>{startDate}</strong> hasta{" "}
              <strong>{endDate}</strong>
            </p>
          ) : startDate ? (
            <p>
              Mostrando cotizaciones desde <strong>{startDate}</strong>
            </p>
          ) : (
            <p>
              Mostrando cotizaciones hasta <strong>{endDate}</strong>
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default React.memo(DateFiltersSection);
