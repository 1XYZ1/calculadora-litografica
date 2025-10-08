import React from "react";

/**
 * Componente para información básica del item (nombre, talonarios, cantidad, dimensiones)
 */
const ItemBasicInfo = ({ currentItem, handleItemChange }) => {
  return (
    <div className="space-y-6">
      {/* Nombre del Item */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Nombre del Item
        </label>
        <input
          name="quotationName"
          type="text"
          value={currentItem.quotationName}
          onChange={handleItemChange}
          className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
          placeholder="Ej. Tarjetas de Presentación"
        />
      </div>

      {/* Checkbox de Talonarios */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center space-x-3 mb-3">
          <input
            name="isTalonarios"
            type="checkbox"
            checked={currentItem.isTalonarios}
            onChange={handleItemChange}
            className="h-5 w-5 text-blue-600 rounded"
          />
          <label className="text-gray-700 text-sm font-bold">
            Calcular por Talonarios
          </label>
        </div>

        {/* Campos de talonarios (solo visibles si está activado) */}
        {currentItem.isTalonarios && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1">
                Cant. Talonarios
              </label>
              <input
                name="numTalonarios"
                type="number"
                value={currentItem.numTalonarios}
                onChange={handleItemChange}
                className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3"
                placeholder="Ej. 10"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1">
                Cant. Hojas
              </label>
              <input
                name="sheetsPerSet"
                type="number"
                value={currentItem.sheetsPerSet}
                onChange={handleItemChange}
                className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3"
                placeholder="Ej. 50"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1">
                Cant. Copias
              </label>
              <input
                name="copiesPerSet"
                type="number"
                value={currentItem.copiesPerSet}
                onChange={handleItemChange}
                className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3"
                placeholder="Ej. 1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cantidad total de piezas */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {currentItem.isTalonarios
            ? "Total de Piezas (Calculado)"
            : "Cantidad (Pieza Principal)"}
        </label>
        <input
          name="totalPieces"
          type="number"
          value={currentItem.totalPieces}
          onChange={handleItemChange}
          readOnly={currentItem.isTalonarios}
          className={`shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 ${
            currentItem.isTalonarios ? "bg-gray-200" : ""
          }`}
          placeholder="Ej. 5000"
        />
      </div>

      {/* Dimensiones */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Dimensiones (cm)
        </label>
        <div className="flex gap-4">
          <input
            name="pieceWidthCm"
            type="number"
            value={currentItem.pieceWidthCm}
            onChange={handleItemChange}
            className="shadow appearance-none border rounded-lg w-1/2 py-3 px-4"
            placeholder="Ancho"
          />
          <input
            name="pieceHeightCm"
            type="number"
            value={currentItem.pieceHeightCm}
            onChange={handleItemChange}
            className="shadow appearance-none border rounded-lg w-1/2 py-3 px-4"
            placeholder="Alto"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ItemBasicInfo);
