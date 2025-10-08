import React from "react";

/**
 * Componente para mostrar la producción total de piezas adicionales
 */
const AdditionalPiecesYield = ({
  layoutInfo,
  currentItem,
  requiredFullSheets,
}) => {
  // No mostrar si no hay layout info o no hay rendimientos adicionales
  if (
    !layoutInfo ||
    !layoutInfo.additionalYields ||
    Object.keys(layoutInfo.additionalYields).length === 0 ||
    !requiredFullSheets ||
    requiredFullSheets === 0
  ) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
      <h4 className="text-lg font-bold text-orange-800 mb-3 text-center">
        Producción Total de Piezas Adicionales
      </h4>
      <div className="text-sm text-orange-700 space-y-2">
        <p className="text-xs text-center mb-3">
          Basado en un total de <strong>{requiredFullSheets}</strong> pliegos
          necesarios para la pieza principal.
        </p>
        {Object.entries(layoutInfo.additionalYields).map(([id, data]) => {
          const requestedQty =
            currentItem.additionalPieces.find((p) => p.id === id)?.quantity ||
            0;
          const totalPossibleQty = data.countPerSheet * requiredFullSheets;
          const canFulfill = totalPossibleQty >= requestedQty;

          return (
            <div
              key={id}
              className={`p-3 rounded-md ${
                canFulfill ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <p className="font-semibold">{data.name}:</p>
              <p>
                Solicitaste: <strong>{requestedQty}</strong> piezas.
              </p>
              <p>
                Se pueden producir hasta: <strong>{totalPossibleQty}</strong>{" "}
                piezas.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(AdditionalPiecesYield);
