import React, { useMemo } from "react";
import { SECTION_COLORS, PLATE_SIZE_OPTIONS } from "../../../utils/constants";

/**
 * Componente individual para campo de precio de plancha
 * Memoizado para evitar re-renders innecesarios
 */
const PriceField = React.memo(({
  plate,
  platePriceInputs,
  handlePlatePriceInputChange,
  deletePlateSize,
  loadingPlatesAll
}) => {
  // Detectar cambios pendientes para esta plancha específica
  const hasChanged = useMemo(() => {
    const inputValue = parseFloat(platePriceInputs[plate.id]);
    return !isNaN(inputValue) && inputValue !== plate.price;
  }, [platePriceInputs, plate.id, plate.price]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 transition-all duration-200 hover:border-gray-300">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {plate.size}
          {hasChanged && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
              Modificado
            </span>
          )}
        </label>
        <button
          onClick={() => deletePlateSize(plate.id)}
          disabled={loadingPlatesAll}
          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          title="Eliminar plancha"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <input
        type="number"
        step="0.01"
        placeholder="0.00"
        value={platePriceInputs[plate.id] || ""}
        onChange={(e) =>
          handlePlatePriceInputChange(plate.id, e.target.value)
        }
        disabled={loadingPlatesAll}
        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          hasChanged
            ? "border-amber-400 bg-amber-50"
            : "border-gray-300 bg-white"
        }`}
      />
      <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        Actual: ${plate.price?.toFixed(2) || "0.00"} /plancha
      </p>
    </div>
  );
});

PriceField.displayName = 'PriceField';

/**
 * Sección para gestionar tamaños de plancha y sus precios con UX mejorada:
 * - Edición inline de todos los precios
 * - Actualización masiva con un solo botón
 * - Indicadores visuales de cambios pendientes
 * - Validación en tiempo real
 */
function PlatesSection({
  plateSizes,
  newPlateSizeName,
  setNewPlateSizeName,
  newPlateSizePrice,
  setNewPlateSizePrice,
  platePriceInputs,
  handlePlatePriceInputChange,
  addPlateSize,
  updateAllPlatePrices,
  deletePlateSize,
  loadingPlatesAll,
}) {
  const colors = SECTION_COLORS.plates;

  // Filtrar opciones de planchas que ya están agregadas
  const availablePlateOptions = useMemo(() => {
    const existingSizes = plateSizes.map((plate) => plate.size.toLowerCase());
    return PLATE_SIZE_OPTIONS.filter(
      (option) => !existingSizes.includes(option.value.toLowerCase())
    );
  }, [plateSizes]);

  // Detectar si hay cambios pendientes en alguna plancha
  const hasAnyChanges = useMemo(() => {
    return plateSizes.some((plate) => {
      const inputValue = parseFloat(platePriceInputs[plate.id]);
      return !isNaN(inputValue) && inputValue !== plate.price;
    });
  }, [plateSizes, platePriceInputs]);

  return (
    <section className={`${colors.bg} p-4 sm:p-6 rounded-xl shadow-md`}>
      <h3
        className={`text-xl sm:text-2xl font-bold ${colors.title} mb-4 sm:mb-6 flex items-center gap-2`}
      >
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xl sm:text-2xl">Precios de Planchas</span>
      </h3>

      {/* Formulario para añadir nueva plancha */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6 border-2 border-gray-200">
        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-base sm:text-lg">
            Añadir Nuevo Tamaño de Plancha
          </span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr,1.5fr,auto] gap-3 sm:gap-4">
          <div className="relative">
            <select
              value={newPlateSizeName}
              onChange={(e) => setNewPlateSizeName(e.target.value)}
              className="w-full appearance-none p-2.5 sm:p-3 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer text-sm sm:text-base"
              disabled={availablePlateOptions.length === 0}
            >
              <option value="">
                {availablePlateOptions.length === 0
                  ? "Todas las planchas están agregadas"
                  : "Seleccione Tamaño"}
              </option>
              {availablePlateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <input
            type="number"
            step="0.01"
            placeholder="Precio (ej. 10.00)"
            value={newPlateSizePrice}
            onChange={(e) => setNewPlateSizePrice(e.target.value)}
            className="p-2.5 sm:p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
          />
          <button
            onClick={addPlateSize}
            disabled={availablePlateOptions.length === 0}
            className={`${colors.button} min-h-[44px] text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base`}
          >
            Añadir Plancha
          </button>
        </div>
      </div>

      {/* Lista de planchas existentes */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-2 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                Planchas Existentes
              </h4>
              <p className="text-xs sm:text-sm text-gray-500">
                {plateSizes.length} tamaños configurados
              </p>
            </div>
          </div>

          {/* Botón de actualización masiva */}
          <button
            onClick={updateAllPlatePrices}
            disabled={loadingPlatesAll || !hasAnyChanges}
            className={`${colors.button} min-h-[44px] text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base relative ${
              hasAnyChanges ? "ring-2 ring-amber-400 ring-offset-2" : ""
            }`}
          >
            {loadingPlatesAll ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Actualizar
                {hasAnyChanges && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {plateSizes.map((plate) => (
            <PriceField
              key={plate.id}
              plate={plate}
              platePriceInputs={platePriceInputs}
              handlePlatePriceInputChange={handlePlatePriceInputChange}
              deletePlateSize={deletePlateSize}
              loadingPlatesAll={loadingPlatesAll}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(PlatesSection);
