import React from "react";

/**
 * Componente para configurar colores de impresión (tiro/retiro, work-and-turn)
 */
const ColorsPrintingConfig = ({ currentItem, handleItemChange }) => {
  const isDigital = currentItem.printingAreaOption === "quarter_sheet_digital";

  // Si es digital, mostrar solo checkbox de dúplex
  if (isDigital) {
    return (
      <div className="flex items-center space-x-3 p-4 bg-cyan-50 rounded-lg">
        <input
          name="isDigitalDuplex"
          type="checkbox"
          checked={currentItem.isDigitalDuplex}
          onChange={handleItemChange}
          className="h-5 w-5 text-cyan-600 rounded"
        />
        <label className="text-cyan-800 text-sm font-bold">
          ¿Tiro y Retiro Digital?
        </label>
      </div>
    );
  }

  // Para offset, mostrar configuración completa
  return (
    <div className="space-y-4">
      {/* Colores Tiro */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Colores (Tiro)
        </label>
        <input
          name="numColorsTiro"
          type="number"
          value={currentItem.numColorsTiro}
          onChange={handleItemChange}
          className="shadow appearance-none border rounded-lg w-full py-3 px-4"
          placeholder="Ej. 4 (CMYK)"
        />
      </div>

      {/* Checkbox Tiro y Retiro */}
      <div className="flex items-center space-x-3">
        <input
          name="isTiroRetiro"
          type="checkbox"
          checked={currentItem.isTiroRetiro}
          onChange={handleItemChange}
          className="h-5 w-5 text-blue-600 rounded"
        />
        <label className="text-gray-700 text-sm font-bold">
          ¿Tiro y Retiro?
        </label>
      </div>

      {/* Configuración de Work-and-Turn */}
      {currentItem.isTiroRetiro && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-3">
            <input
              id="isWorkAndTurn"
              name="isWorkAndTurn"
              type="checkbox"
              checked={currentItem.isWorkAndTurn}
              onChange={handleItemChange}
              className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div className="flex-1">
              <label
                htmlFor="isWorkAndTurn"
                className="text-gray-700 text-sm font-bold"
              >
                Montaje Tiro/Retiro en una cara (Work-and-Turn)
              </label>
              <p className="text-xs text-gray-500">
                Monta el tiro y el retiro en la misma plancha, usando una sola
                cara del pliego. El rendimiento por pliego se divide entre 2.
                Requiere que quepan al menos 2 piezas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Colores Retiro */}
      {currentItem.isTiroRetiro && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">
            Colores (Retiro)
          </label>
          <input
            name="numColorsRetiro"
            type="number"
            value={currentItem.numColorsRetiro}
            onChange={handleItemChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4"
            placeholder="Ej. 1 (Negro)"
            disabled={currentItem.isWorkAndTurn}
          />
          <p className="text-xs text-gray-500 mt-1">
            {currentItem.isWorkAndTurn
              ? "En modo Work-and-Turn, se asumen los mismos colores del tiro."
              : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ColorsPrintingConfig);
