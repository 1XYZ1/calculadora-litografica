import React from "react";

/**
 * Componente para seleccionar papel, plancha, máquina y sobrante
 * Solo para impresión offset
 */
const PaperMachineSelector = ({
  currentItem,
  handleItemChange,
  paperTypes,
  plateSizes,
  machineTypes,
}) => {
  // Solo mostrar para offset (no digital)
  if (currentItem.printingAreaOption === "quarter_sheet_digital") {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Tipo de Papel */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Tipo de Papel
        </label>
        <select
          name="selectedPaperTypeId"
          value={currentItem.selectedPaperTypeId}
          onChange={handleItemChange}
          className="shadow border rounded-lg w-full py-3 px-4"
        >
          <option value="">Seleccione papel</option>
          {paperTypes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (${(p.pricePerSheet || 0).toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* Sobrante */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Sobrante (pliegos extra)
        </label>
        <input
          name="sobrantePliegos"
          type="number"
          value={currentItem.sobrantePliegos}
          onChange={handleItemChange}
          className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
          placeholder="Ej. 10"
        />
      </div>

      {/* Tamaño de Plancha */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Tamaño de Plancha
        </label>
        <select
          name="selectedPlateSizeId"
          value={currentItem.selectedPlateSizeId}
          onChange={handleItemChange}
          className="shadow border rounded-lg w-full py-3 px-4"
        >
          <option value="">Seleccione plancha</option>
          {plateSizes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.size} (${p.price.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de Máquina */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Tipo de Máquina
        </label>
        <select
          name="selectedMachineTypeId"
          value={currentItem.selectedMachineTypeId}
          onChange={handleItemChange}
          className="shadow border rounded-lg w-full py-3 px-4"
        >
          <option value="">Seleccione máquina</option>
          {machineTypes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} (${m.millarPrice.toFixed(2)}/millar)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default React.memo(PaperMachineSelector);
