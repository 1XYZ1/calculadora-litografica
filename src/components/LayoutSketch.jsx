import React from "react";

export default function LayoutSketch({ layoutInfo, isWorkAndTurn }) {
  if (
    !layoutInfo ||
    !layoutInfo.placedPieces ||
    layoutInfo.placedPieces.length === 0
  ) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 mt-6">
        <p>El croquis del montaje se mostrará aquí.</p>
      </div>
    );
  }

  const {
    sheetW,
    sheetH,
    placedPieces,
    cols,
    rows,
    rotated,
    pieceW,
    pieceH,
    occupiedW,
    occupiedH,
    separation = 0,
    additionalYields,
  } = layoutInfo;

  const svgContainerWidth = 280;
  const scale = svgContainerWidth / sheetW;
  const svgHeight = sheetH * scale;

  const svgPieces = placedPieces.map((piece) => {
    let fillColor;
    if (piece.type === "main") {
      fillColor = "#a7f3d0";
    } else if (piece.type === "additional") {
      fillColor = "#f3d0a7";
    } else {
      fillColor = "#cccccc";
    }

    if (piece.type === "main" && isWorkAndTurn) {
      const totalMainPieces = rows * cols;
      const pieceIndex =
        parseInt(piece.id.split("-")[1]) * cols +
        parseInt(piece.id.split("-")[2]);
      const isRetiro = pieceIndex >= Math.floor(totalMainPieces / 2);
      fillColor = isRetiro ? "#a7c7f3" : "#a7f3d0";
    }

    return (
      <rect
        key={piece.id}
        x={piece.x * scale}
        y={piece.y * scale}
        width={piece.w * scale}
        height={piece.h * scale}
        fill={fillColor}
        stroke="#374151"
        strokeWidth="0.5"
      />
    );
  });

  const wastedWidth = sheetW - occupiedW;
  const wastedHeight = sheetH - occupiedH;
  const hasAdditionalPieces = Object.keys(additionalYields || {}).length > 0;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-lg font-bold text-gray-800 mb-3 text-center">
        Croquis del Montaje
      </h4>
      <div className="flex items-center justify-center space-x-2">
        <span
          className="text-xs font-medium text-gray-600"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {sheetH.toFixed(1)} cm
        </span>
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-gray-600 mb-1">
            {sheetW.toFixed(1)} cm
          </span>
          <div
            className="border border-gray-400"
            style={{ width: svgContainerWidth, height: svgHeight }}
          >
            <svg width="100%" height="100%">
              {svgPieces}
            </svg>
          </div>
        </div>
      </div>
      <div className="flex justify-center space-x-4 mt-3 text-xs">
        {isWorkAndTurn ? (
          <>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#a7f3d0] mr-1 border border-gray-400 rounded-sm"></div>
              <span>Tiro (Principal)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#a7c7f3] mr-1 border border-gray-400 rounded-sm"></div>
              <span>Retiro (Principal)</span>
            </div>
          </>
        ) : (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#a7f3d0] mr-1 border border-gray-400 rounded-sm"></div>
            <span>Pieza Principal</span>
          </div>
        )}
        {hasAdditionalPieces && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#f3d0a7] mr-1 border border-gray-400 rounded-sm"></div>
            <span>Piezas Adicionales</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-gray-300">
        <h5 className="text-sm font-bold text-gray-700 mb-2">
          Detalles del Montaje Principal:
        </h5>
        <div className="text-xs text-gray-700 mt-3 space-y-1">
          <p>
            <strong className="font-semibold">Montaje:</strong> {cols} columnas
            x {rows} filas.
          </p>
          {separation > 0 && (
            <p>
              <strong className="font-semibold text-red-700">
                Separación (Troquel):
              </strong>{" "}
              {separation * 10} mm
            </p>
          )}
          <p>
            <strong className="font-semibold">Orientación de pieza:</strong>{" "}
            {(rotated ? pieceH : pieceW).toFixed(1)}cm x{" "}
            {(rotated ? pieceW : pieceH).toFixed(1)}cm{" "}
            {rotated ? (
              <span className="font-bold text-blue-600">(Rotada)</span>
            ) : (
              "(Normal)"
            )}
          </p>
          <p className="text-red-600">
            <strong className="font-semibold">
              Desperdicio (respecto a pieza principal):
            </strong>{" "}
            {wastedWidth.toFixed(2)} cm (ancho), {wastedHeight.toFixed(2)} cm
            (alto)
          </p>
        </div>
      </div>

      {hasAdditionalPieces && (
        <div className="mt-4 pt-2 border-t border-gray-300">
          <h5 className="text-sm font-bold text-gray-700 mb-2">
            Rendimiento de Piezas Adicionales (por pliego):
          </h5>
          <ul className="text-xs text-gray-600 space-y-1">
            {Object.entries(additionalYields).map(([id, data]) => (
              <li key={id}>
                - {data.countPerSheet} piezas de {data.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
