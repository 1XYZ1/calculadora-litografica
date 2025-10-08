import React from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Sección para configurar el porcentaje de ganancia
 */
function ProfitSection({
  profitPercentageInput,
  setProfitPercentageInput,
  profitPercentageData,
  updateProfitPercentage,
}) {
  const colors = SECTION_COLORS.profit;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Porcentaje de Ganancia
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">Porcentaje (%):</label>
        <input
          type="number"
          step="0.01"
          placeholder="Ej. 20 (para 20%)"
          value={profitPercentageInput}
          onChange={(e) => setProfitPercentageInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        />
        <button
          onClick={updateProfitPercentage}
          className={`${colors.button} text-white font-bold py-2 rounded-lg transition duration-300`}
        >
          Actualizar Ganancia
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual:{" "}
        {profitPercentageData !== undefined
          ? (profitPercentageData * 100).toFixed(2)
          : "0.00"}
        %
      </p>
    </section>
  );
}

export default React.memo(ProfitSection);
