import React from "react";

/**
 * Componente para gestionar piezas adicionales
 */
const AdditionalPiecesManager = ({
  currentItem,
  addAdditionalPiece,
  removeAdditionalPiece,
  handleAdditionalPieceChange,
}) => {
  // No mostrar si es modo talonarios
  if (currentItem.isTalonarios) {
    return null;
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-gray-700 text-sm font-bold">
          Piezas de Diferentes Tamaños (Opcional)
        </h4>
        <button
          type="button"
          onClick={addAdditionalPiece}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors"
        >
          +
        </button>
      </div>

      <div className="space-y-2">
        {currentItem.additionalPieces.map((piece) => (
          <div key={piece.id} className="grid grid-cols-4 gap-2 items-center">
            <input
              type="number"
              placeholder="Ancho"
              value={piece.width}
              onChange={(e) =>
                handleAdditionalPieceChange(piece.id, "width", e.target.value)
              }
              className="shadow-sm border rounded py-2 px-2 text-sm col-span-1"
            />
            <input
              type="number"
              placeholder="Alto"
              value={piece.height}
              onChange={(e) =>
                handleAdditionalPieceChange(piece.id, "height", e.target.value)
              }
              className="shadow-sm border rounded py-2 px-2 text-sm col-span-1"
            />
            <input
              type="number"
              placeholder="Cant."
              value={piece.quantity}
              onChange={(e) =>
                handleAdditionalPieceChange(
                  piece.id,
                  "quantity",
                  e.target.value
                )
              }
              className="shadow-sm border rounded py-2 px-2 text-sm col-span-1"
            />
            <button
              type="button"
              onClick={() => removeAdditionalPiece(piece.id)}
              className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs col-span-1 transition-colors"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(AdditionalPiecesManager);
