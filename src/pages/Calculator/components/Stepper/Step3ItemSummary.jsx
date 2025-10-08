import React, { useState } from "react";
import ItemCostPreview from "../ItemFormPanel/ItemCostPreview";
import LayoutVisualization from "../LayoutVisualization";
import AdditionalPiecesYield from "../ItemFormPanel/AdditionalPiecesYield";

/**
 * Paso 3: Resumen del Item
 * Vista previa del cálculo completo antes de agregar al presupuesto
 */
const Step3ItemSummary = ({
  currentItem,
  itemResult,
  layoutInfo,
  troquelLayoutInfo,
  editingItemId,
  onAddItemToQuotation,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Resumen del Item
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Revisa el costo calculado y los detalles antes de agregar
          </p>
        </div>

        {/* Nombre del item */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">
            {currentItem.quotationName || "Sin nombre"}
          </h3>
          <p className="text-sm sm:text-base text-blue-600">
            {currentItem.totalPieces} unidades • {currentItem.pieceWidthCm} x{" "}
            {currentItem.pieceHeightCm} cm
          </p>
        </div>

        {/* Costo total */}
        <ItemCostPreview totalGeneral={itemResult.totalGeneral} />

        {/* Desglose de costos (expandible) */}
        <div className="mt-4 sm:mt-6">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors min-h-[44px]"
          >
            <span className="text-base sm:text-lg font-semibold text-gray-700">
              Ver desglose de costos
            </span>
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform ${
                showBreakdown ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showBreakdown && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 animate-fadeIn">
              <h4 className="text-lg font-bold text-gray-800 mb-3">
                Desglose de Costos
              </h4>

              {/* Costos de papel */}
              {itemResult.paperCost > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-base text-gray-700">Papel</span>
                  <span className="font-semibold text-gray-800">
                    ${itemResult.paperCost.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Costos de plancha */}
              {itemResult.plateCost > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-base text-gray-700">Plancha</span>
                  <span className="font-semibold text-gray-800">
                    ${itemResult.plateCost.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Costos de máquina */}
              {itemResult.machineCost > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-base text-gray-700">Máquina</span>
                  <span className="font-semibold text-gray-800">
                    ${itemResult.machineCost.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Costos de acabados */}
              {itemResult.finishingCost > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-base text-gray-700">Acabados</span>
                  <span className="font-semibold text-gray-800">
                    ${itemResult.finishingCost.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Margen de ganancia */}
              {itemResult.profitAmount > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-base text-gray-700">
                    Margen de Ganancia
                  </span>
                  <span className="font-semibold text-green-600">
                    ${itemResult.profitAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-gray-300">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  ${itemResult.totalGeneral.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Visualización del layout */}
        <div className="mt-4 sm:mt-6">
          <LayoutVisualization
            layoutInfo={layoutInfo}
            troquelLayoutInfo={troquelLayoutInfo}
            isWorkAndTurn={
              currentItem.isWorkAndTurn && currentItem.isTiroRetiro
            }
            isTroqueladoSelected={currentItem.isTroqueladoSelected}
          />
        </div>

        {/* Rendimiento de piezas adicionales */}
        <AdditionalPiecesYield
          layoutInfo={layoutInfo}
          currentItem={currentItem}
          requiredFullSheets={itemResult.requiredFullSheets}
        />
      </div>

      {/* Indicador de ayuda */}
      <div className="bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm sm:text-base text-green-700">
              <strong>Tip:</strong> Revisa el desglose de costos y la
              visualización del layout para confirmar que todo esté correcto.
              Una vez que agregues el item, podrás continuar agregando más items
              o finalizar el presupuesto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Step3ItemSummary);
