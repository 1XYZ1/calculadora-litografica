import React from "react";

/**
 * Componente para mostrar el costo total del item actual
 */
const ItemCostPreview = ({ totalGeneral }) => {
  return (
    <div className="bg-blue-100 p-4 rounded-lg text-center mt-4">
      <p className="font-semibold text-blue-800">Total para este Item:</p>
      <span className="text-blue-800 text-3xl font-extrabold">
        ${totalGeneral.toFixed(2)}
      </span>
    </div>
  );
};

export default React.memo(ItemCostPreview);
