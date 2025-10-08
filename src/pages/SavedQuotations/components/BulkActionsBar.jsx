import React from "react";

/**
 * Barra de acciones masivas para selección y eliminación
 */
const BulkActionsBar = ({
  selectedCount,
  totalCount,
  onDeleteSelected,
  onSelectAll,
  onDeselectAll,
}) => {
  // No mostrar si no hay cotizaciones
  if (totalCount === 0) {
    return null;
  }

  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      {/* Botones de selección */}
      <div className="flex gap-2">
        {allSelected ? (
          <button
            onClick={onDeselectAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Deseleccionar todas las cotizaciones"
          >
            Deseleccionar Todo
          </button>
        ) : (
          <button
            onClick={onSelectAll}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            aria-label="Seleccionar todas las cotizaciones"
          >
            Seleccionar Todo
          </button>
        )}
      </div>

      {/* Contador y botón de eliminar */}
      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <span className="text-sm text-gray-600">
            {selectedCount} de {totalCount} seleccionada
            {selectedCount !== 1 ? "s" : ""}
          </span>
        )}

        <button
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          className={`px-6 py-2 rounded-lg transition duration-300 shadow-md text-sm font-semibold ${
            selectedCount > 0
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          aria-label={`Eliminar ${selectedCount} cotización(es) seleccionada(s)`}
        >
          Eliminar Seleccionadas ({selectedCount})
        </button>
      </div>
    </div>
  );
};

export default React.memo(BulkActionsBar);
