import React from "react";
import ItemCard from "./ItemCard";

/**
 * Componente para mostrar la lista de items del presupuesto
 */
const ItemsList = ({ items, onEdit, onRemove, onShowBreakdown }) => {
  if (items.length === 0) {
    return (
      <p className="text-gray-500 text-center">
        Aún no hay items en este presupuesto.
      </p>
    );
  }

  return (
    <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onRemove={onRemove}
          onShowBreakdown={onShowBreakdown}
        />
      ))}
    </ul>
  );
};

export default React.memo(ItemsList);
