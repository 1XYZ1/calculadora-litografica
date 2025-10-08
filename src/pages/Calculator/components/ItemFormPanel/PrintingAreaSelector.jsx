import React from "react";
import { PRINTING_AREAS } from "../../../../utils/constants";

/**
 * Componente para seleccionar el área de impresión
 */
const PrintingAreaSelector = ({ currentItem, handleItemChange }) => {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Área de Impresión
      </label>
      <select
        name="printingAreaOption"
        value={currentItem.printingAreaOption}
        onChange={handleItemChange}
        className="shadow border rounded-lg w-full py-3 px-4 text-gray-700"
      >
        <option value="">Seleccione un área</option>
        {Object.values(PRINTING_AREAS).map((area) => (
          <option key={area.value} value={area.value}>
            {area.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(PrintingAreaSelector);
