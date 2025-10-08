import React from "react";
import ItemsList from "./ItemsList";
import QuotationSummary from "./QuotationSummary";

/**
 * Panel derecho con items y totales del presupuesto
 */
const ResultsPanel = ({
  items,
  grandTotals,
  bcvRate,
  editingQuotationId,
  onEditItem,
  onRemoveItem,
  onShowBreakdown,
  onSave,
  onUpdate,
  onCancel,
  onPreview,
}) => {
  return (
    <div className="space-y-6">
      {/* Lista de Items */}
      <div className="bg-gray-100 p-6 rounded-xl shadow-inner mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Items del Presupuesto
        </h3>
        <ItemsList
          items={items}
          onEdit={onEditItem}
          onRemove={onRemoveItem}
          onShowBreakdown={onShowBreakdown}
        />
      </div>

      {/* Resumen y Acciones */}
      <QuotationSummary
        grandTotals={grandTotals}
        bcvRate={bcvRate}
        editingQuotationId={editingQuotationId}
        onSave={onSave}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onPreview={onPreview}
      />
    </div>
  );
};

export default ResultsPanel;
