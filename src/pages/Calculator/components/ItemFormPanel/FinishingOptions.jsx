import React from "react";
import { PRINTING_AREAS } from "../../../../utils/constants";

/**
 * Componente para seleccionar acabados (UV, laminados, remate, signado, troquelado)
 */
const FinishingOptions = ({ currentItem, handleItemChange }) => {
  const isDigital = currentItem.printingAreaOption === "quarter_sheet_digital";

  return (
    <div className="space-y-4 pt-6 border-t">
      <h3 className="text-2xl font-bold text-orange-600 mb-4">
        Acabados para este Item
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* UV */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isUVSelected"
            checked={currentItem.isUVSelected}
            onChange={handleItemChange}
            className="h-5 w-5 rounded"
          />
          <label className="text-sm font-bold">UV</label>
          {currentItem.isUVSelected && (
            <select
              name="uvSizeOption"
              value={currentItem.uvSizeOption}
              onChange={handleItemChange}
              className="shadow-sm border rounded-lg py-1 px-2 text-sm text-gray-700"
            >
              <option value="">Tamaño</option>
              {Object.values(PRINTING_AREAS).map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label.split(" (")[0]}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Remate */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isRemateSelected"
            checked={currentItem.isRemateSelected}
            onChange={handleItemChange}
            className="h-5 w-5 rounded"
            disabled={isDigital}
          />
          <label
            className={`text-sm font-bold ${isDigital && "text-gray-400"}`}
          >
            Remate
          </label>
        </div>

        {/* Laminado Mate */}
        <div className="col-span-1 border-t pt-4 md:border-none md:pt-0">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isLaminadoMateSelected"
              checked={currentItem.isLaminadoMateSelected}
              onChange={handleItemChange}
              className="h-5 w-5 rounded"
            />
            <label className="text-sm font-bold">Laminado Mate</label>
          </div>
          {currentItem.isLaminadoMateSelected && (
            <div className="flex items-center space-x-3 mt-2 ml-8">
              <input
                type="checkbox"
                name="isLaminadoMateTiroRetiro"
                checked={currentItem.isLaminadoMateTiroRetiro}
                onChange={handleItemChange}
                className="h-4 w-4 rounded"
              />
              <label className="text-xs font-medium">Ambas Caras</label>
            </div>
          )}
        </div>

        {/* Laminado Brillante */}
        <div className="col-span-1 border-t pt-4 md:border-none md:pt-0">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isLaminadoBrillanteSelected"
              checked={currentItem.isLaminadoBrillanteSelected}
              onChange={handleItemChange}
              className="h-5 w-5 rounded"
            />
            <label className="text-sm font-bold">Laminado Brillante</label>
          </div>
          {currentItem.isLaminadoBrillanteSelected && (
            <div className="flex items-center space-x-3 mt-2 ml-8">
              <input
                type="checkbox"
                name="isLaminadoBrillanteTiroRetiro"
                checked={currentItem.isLaminadoBrillanteTiroRetiro}
                onChange={handleItemChange}
                className="h-4 w-4 rounded"
              />
              <label className="text-xs font-medium">Ambas Caras</label>
            </div>
          )}
        </div>

        {/* Signado */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isSignadoSelected"
            checked={currentItem.isSignadoSelected}
            onChange={handleItemChange}
            className="h-5 w-5 rounded"
            disabled={isDigital}
          />
          <label
            className={`text-sm font-bold ${isDigital && "text-gray-400"}`}
          >
            Signado
          </label>
        </div>

        {/* Troquelado */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isTroqueladoSelected"
            checked={currentItem.isTroqueladoSelected}
            onChange={handleItemChange}
            className="h-5 w-5 rounded"
            disabled={isDigital}
          />
          <label
            className={`text-sm font-bold ${isDigital && "text-gray-400"}`}
          >
            Troquelado
          </label>
        </div>

        {/* Precio del troquel (fijo) */}
        <div className="flex items-center space-x-3 col-span-2 pt-2">
          <label className="text-sm font-bold w-1/3">
            Costo Troquel (fijo)
          </label>
          <input
            type="number"
            name="troquelPrice"
            value={currentItem.troquelPrice}
            onChange={handleItemChange}
            className="shadow-sm appearance-none border rounded-lg w-2/3 py-2 px-3 text-gray-700"
            placeholder="Precio del troquel"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(FinishingOptions);
