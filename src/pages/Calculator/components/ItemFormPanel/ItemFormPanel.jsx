import React from "react";
import ItemBasicInfo from "./ItemBasicInfo";
import AdditionalPiecesManager from "./AdditionalPiecesManager";
import PrintingAreaSelector from "./PrintingAreaSelector";
import ColorsPrintingConfig from "./ColorsPrintingConfig";
import PaperMachineSelector from "./PaperMachineSelector";
import FinishingOptions from "./FinishingOptions";
import ItemCostPreview from "./ItemCostPreview";
import AdditionalPiecesYield from "./AdditionalPiecesYield";
import LayoutVisualization from "../LayoutVisualization";

/**
 * Panel izquierdo con el formulario completo del item
 */
const ItemFormPanel = ({
  currentItem,
  handleItemChange,
  addAdditionalPiece,
  removeAdditionalPiece,
  handleAdditionalPieceChange,
  paperTypes,
  plateSizes,
  machineTypes,
  itemResult,
  layoutInfo,
  troquelLayoutInfo,
  editingItemId,
  onAddOrUpdate,
}) => {
  return (
    <div className="space-y-6 border border-gray-200 p-6 rounded-xl">
      <h3 className="text-2xl font-bold text-blue-700 mb-4">
        {editingItemId ? "Editando Item" : "Añadir Item al Presupuesto"}
      </h3>

      <ItemBasicInfo
        currentItem={currentItem}
        handleItemChange={handleItemChange}
      />

      <AdditionalPiecesManager
        currentItem={currentItem}
        addAdditionalPiece={addAdditionalPiece}
        removeAdditionalPiece={removeAdditionalPiece}
        handleAdditionalPieceChange={handleAdditionalPieceChange}
      />

      <PrintingAreaSelector
        currentItem={currentItem}
        handleItemChange={handleItemChange}
      />

      <ColorsPrintingConfig
        currentItem={currentItem}
        handleItemChange={handleItemChange}
      />

      <PaperMachineSelector
        currentItem={currentItem}
        handleItemChange={handleItemChange}
        paperTypes={paperTypes}
        plateSizes={plateSizes}
        machineTypes={machineTypes}
      />

      <FinishingOptions
        currentItem={currentItem}
        handleItemChange={handleItemChange}
      />

      <ItemCostPreview totalGeneral={itemResult.totalGeneral} />

      <LayoutVisualization
        layoutInfo={layoutInfo}
        troquelLayoutInfo={troquelLayoutInfo}
        isWorkAndTurn={currentItem.isWorkAndTurn && currentItem.isTiroRetiro}
        isTroqueladoSelected={currentItem.isTroqueladoSelected}
      />

      <AdditionalPiecesYield
        layoutInfo={layoutInfo}
        currentItem={currentItem}
        requiredFullSheets={itemResult.requiredFullSheets}
      />

      <button
        onClick={onAddOrUpdate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
      >
        {editingItemId ? "Actualizar Item" : "Añadir Item al Presupuesto"}
      </button>
    </div>
  );
};

export default ItemFormPanel;
