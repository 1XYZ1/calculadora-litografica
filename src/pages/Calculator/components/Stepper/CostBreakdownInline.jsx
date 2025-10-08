import React, { useState } from "react";

/**
 * Componente para mostrar el desglose de costos inline (sin modal)
 * Se usa en el Paso 5 del stepper para mostrar los detalles del cálculo
 */
export default function CostBreakdownInline({ item }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!item) return null;

  const totalCost =
    (item.paperCost || 0) +
    (item.plateCost || 0) +
    (item.millarCost || 0) +
    (item.finishingCost || 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header del acordeón */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-bold text-gray-800">
            Desglose de Costos
          </h3>
        </div>
        <span
          className="text-gray-600 text-xl transition-transform duration-200"
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-6 space-y-3 animate-fade-in">
          {/* Costo de Papel */}
          <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex-1">
              <span className="font-semibold text-gray-800 block mb-1">
                📄 Costo de Papel
              </span>
              {item.totalSheetsWithSobrante > 0 && (
                <span className="text-xs text-gray-500 block">
                  {item.requiredFullSheets} pliegos + {item.sobrantePliegos}{" "}
                  sobrante = {item.totalSheetsWithSobrante} total
                </span>
              )}
            </div>
            <span className="font-bold text-lg text-gray-800 ml-4">
              ${(item.paperCost || 0).toFixed(2)}
            </span>
          </div>

          {/* Costo de Planchas */}
          <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex-1">
              <span className="font-semibold text-gray-800 block mb-1">
                🔲 Costo de Planchas
              </span>
              {item.numPlates > 0 && (
                <span className="text-xs text-gray-500 block">
                  {item.numPlates} planchas
                </span>
              )}
            </div>
            <span className="font-bold text-lg text-gray-800 ml-4">
              ${(item.plateCost || 0).toFixed(2)}
            </span>
          </div>

          {/* Costo de Tiraje */}
          <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex-1">
              <span className="font-semibold text-gray-800 block mb-1">
                🖨️ Costo de Tiraje
              </span>
              {item.pagesToPrint > 0 && (
                <span className="text-xs text-gray-500 block">
                  {item.totalRuns} pasadas
                </span>
              )}
            </div>
            <span className="font-bold text-lg text-gray-800 ml-4">
              ${(item.millarCost || 0).toFixed(2)}
            </span>
          </div>

          {/* Costo de Acabados */}
          <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex-1">
              <span className="font-semibold text-gray-800 block mb-1">
                ✨ Costo de Acabados
              </span>
            </div>
            <span className="font-bold text-lg text-gray-800 ml-4">
              ${(item.finishingCost || 0).toFixed(2)}
            </span>
          </div>

          {/* Separador */}
          <div className="border-t-2 border-gray-300 my-4"></div>

          {/* Total Costo Directo */}
          <div className="flex justify-between items-center bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border-2 border-yellow-300">
            <span className="font-bold text-yellow-900 flex items-center gap-2">
              <span className="text-xl">💵</span>
              Total Costo Directo
            </span>
            <span className="font-bold text-2xl text-yellow-900">
              ${totalCost.toFixed(2)}
            </span>
          </div>

          {/* Total Final con Ganancia */}
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-300">
            <span className="font-bold text-blue-900 flex items-center gap-2">
              <span className="text-xl">💰</span>
              Total Final (+ Ganancia)
            </span>
            <span className="font-bold text-3xl text-blue-900">
              ${(item.costWithProfit || 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
