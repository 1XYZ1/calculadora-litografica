import React from "react";

/**
 * Componente para mostrar un item individual en la lista
 */
const ItemCard = ({ item, onEdit, onRemove, onShowBreakdown }) => {
  return (
    <li className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
      <div className="flex-1">
        <p className="font-bold text-gray-800">{item.quotationName}</p>
        <p className="text-sm text-gray-600">
          {item.totalPieces} piezas - ${item.totalGeneral.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onShowBreakdown(item)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-md text-sm transition-transform transform hover:scale-110"
          title="Ver desglose de costos"
        >
          ...
        </button>
        <button
          onClick={() => onEdit(item)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-transform transform hover:scale-110"
          title="Editar item"
        >
          Editar
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-transform transform hover:scale-110"
          title="Eliminar item"
        >
          X
        </button>
      </div>
    </li>
  );
};

export default React.memo(ItemCard);
