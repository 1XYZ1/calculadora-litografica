import React from "react";

export default function TroquelLayoutSketch({ layoutInfo }) {
  if (!layoutInfo || layoutInfo.cols === 0 || layoutInfo.rows === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 mt-6">
        <p>El croquis del troquel se mostrará aquí.</p>
      </div>
    );
  }

  const {
    sheetW,
    sheetH,
    pieceW,
    pieceH,
    rows,
    cols,
    rotated,
    separation,
    occupiedW,
    occupiedH,
  } = layoutInfo;

  const finalPieceW = rotated ? pieceH : pieceW;
  const finalPieceH = rotated ? pieceW : pieceH;

  const svgContainerWidth = 280;
  const scale = svgContainerWidth / sheetW;
  const svgHeight = sheetH * scale;

  const pieceSvgW = finalPieceW * scale;
  const pieceSvgH = finalPieceH * scale;
  const separationSvg = separation * scale;
  const effPieceSvgW = pieceSvgW + separationSvg;
  const effPieceSvgH = pieceSvgH + separationSvg;

  const pieces = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      pieces.push(
        <rect
          key={`${i}-${j}`}
          x={j * effPieceSvgW}
          y={i * effPieceSvgH}
          width={pieceSvgW}
          height={pieceSvgH}
          fill="#f3a7a7"
          stroke="#374151"
          strokeWidth="0.5"
        />
      );
    }
  }

  return (
    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
      <h4 className="text-lg font-bold text-red-800 mb-3 text-center">
        Croquis del Troquel (Área: 29 x 24.5 cm)
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
            className="border border-red-400 bg-white"
            style={{ width: svgContainerWidth, height: svgHeight }}
          >
            <svg width="100%" height="100%">
              {pieces}
            </svg>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-700 mt-3 space-y-1">
        <p>
          <strong className="font-semibold">Piezas que caben:</strong>{" "}
          {layoutInfo.count} ({cols} x {rows})
        </p>
        <p>
          <strong className="font-semibold">Separación:</strong>{" "}
          {separation * 10} mm
        </p>
        <p>
          <strong className="font-semibold">Orientación de pieza:</strong>{" "}
          {finalPieceW.toFixed(1)}cm x {finalPieceH.toFixed(1)}cm{" "}
          {rotated ? (
            <span className="font-bold text-red-600">(Rotada)</span>
          ) : (
            "(Normal)"
          )}
        </p>
        <p>
          <strong className="font-semibold">Área ocupada:</strong>{" "}
          {occupiedW.toFixed(2)} cm x {occupiedH.toFixed(2)} cm
        </p>
      </div>
    </div>
  );
}
