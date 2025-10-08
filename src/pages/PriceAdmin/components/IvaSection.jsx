import React from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Sección para configurar el porcentaje de IVA
 */
function IvaSection({
  ivaPercentageInput,
  setIvaPercentageInput,
  ivaPercentageData,
  updateIvaPercentage,
}) {
  const colors = SECTION_COLORS.iva;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Porcentaje de IVA
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">Porcentaje (%):</label>
        <input
          type="number"
          step="0.01"
          placeholder="Ej. 16 (para 16%)"
          value={ivaPercentageInput}
          onChange={(e) => setIvaPercentageInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
        />
        <button
          onClick={updateIvaPercentage}
          className={`${colors.button} text-white font-bold py-2 rounded-lg transition duration-300`}
        >
          Actualizar IVA
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual:{" "}
        {ivaPercentageData !== undefined
          ? (ivaPercentageData * 100).toFixed(2)
          : "0.00"}
        %
      </p>
    </section>
  );
}

export default React.memo(IvaSection);
