import React from "react";
import BaseModal from "./BaseModal";

export default function CostBreakdownModal({ item, onClose }) {
  if (!item) return null;

  const totalCost =
    (item.paperCost || 0) +
    (item.plateCost || 0) +
    (item.millarCost || 0) +
    (item.finishingCost || 0);

  return (
    <BaseModal
      isOpen={!!item}
      onClose={onClose}
      closeOnBackdrop={true}
      closeOnEscape={true}
      size="default"
      className="p-8"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Desglose de Costos: {item.quotationName}
      </h3>
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold">
            Costo de Papel
            {item.totalSheetsWithSobrante > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({item.requiredFullSheets} pliegos + {item.sobrantePliegos}{" "}
                sobrante = {item.totalSheetsWithSobrante} total)
              </span>
            )}
          </span>
          <span className="font-bold text-lg">
            ${(item.paperCost || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold">
            Costo de Planchas
            {item.numPlates > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({item.numPlates} planchas)
              </span>
            )}
          </span>
          <span className="font-bold text-lg">
            ${(item.plateCost || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold">
            Costo de Tiraje
            {item.pagesToPrint > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({item.totalRuns} pasadas)
              </span>
            )}
          </span>
          <span className="font-bold text-lg">
            ${(item.millarCost || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold">Costo de Acabados:</span>
          <span className="font-bold text-lg">
            ${(item.finishingCost || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-yellow-100 p-4 rounded-lg mt-4 border-t-2 border-yellow-200">
          <span className="font-semibold text-yellow-800">
            Total Costo Directo:
          </span>
          <span className="font-bold text-xl text-yellow-800">
            ${totalCost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-blue-100 p-4 rounded-lg mt-4 border-t-2 border-blue-200">
          <span className="font-semibold text-blue-800">
            Total Final (Costo + Ganancia):
          </span>
          <span className="font-bold text-xl text-blue-800">
            ${(item.costWithProfit || 0).toFixed(2)}
          </span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Cerrar
      </button>
    </BaseModal>
  );
}
