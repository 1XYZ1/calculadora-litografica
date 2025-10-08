import React, { useState, useCallback } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import ModalMessage from "../../components/ModalMessage";
import QuotationPreviewModal from "../../components/QuotationPreviewModal";
import CostBreakdownModal from "../../components/CostBreakdownModal";
import QuotationHeader from "./components/QuotationHeader";
import ItemFormPanel from "./components/ItemFormPanel/ItemFormPanel";
import ResultsPanel from "./components/ResultsPanel/ResultsPanel";
import { useDynamicPriceData } from "./hooks/useDynamicPriceData";
import { useItemCalculations } from "./hooks/useItemCalculations";
import { useItemForm } from "./hooks/useItemForm";
import { useQuotation } from "./hooks/useQuotation";
import { useTalonarios } from "./hooks/useTalonarios";
import { useClients } from "../../hooks/useClients";
import { MESSAGES } from "../../utils/constants";

/**
 * Componente principal de la calculadora de cotizaciones
 * Orquesta todos los hooks y componentes especializados
 */
function QuotationCalculator({
  loadedQuotation = null,
  setLoadedQuotation = () => {},
}) {
  const { db, appId, userId } = useFirebase();

  // Estados de modales
  const [modalMessage, setModalMessage] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [breakdownModalItem, setBreakdownModalItem] = useState(null);

  // Hook: Cargar lista de clientes
  const { clients, loading: clientsLoading } = useClients();

  // Estado temporal para clientId (se sincroniza con useQuotation)
  const [tempClientId, setTempClientId] = useState(null);

  // Hook: Cargar datos de precios dinámicos basados en el cliente seleccionado
  const {
    papers: paperTypes,
    plateSizes,
    machineTypes,
    finishingPrices,
    settings,
    loading: pricesLoading,
  } = useDynamicPriceData(tempClientId);

  // Extraer valores de settings
  const profitPercentage = settings.profit || 0;
  const bcvRate = settings.bcv || 0;
  const firestoreLoading = pricesLoading || clientsLoading;

  // Hook: Gestión de la cotización completa
  const {
    mainQuotationName,
    setMainQuotationName,
    clientName,
    setClientName,
    clientId,
    setClientId: setQuotationClientId,
    items,
    grandTotals,
    editingQuotationId,
    addOrUpdateItem,
    editItem,
    removeItem,
    resetQuotation,
    saveQuotation,
    updateQuotation,
  } = useQuotation({
    db,
    appId,
    userId,
    bcvRate,
    loadedQuotation,
    setLoadedQuotation,
  });

  // Sincronizar tempClientId con clientId de la cotización
  const setClientId = useCallback(
    (id) => {
      setTempClientId(id);
      setQuotationClientId(id);
    },
    [setQuotationClientId]
  );

  // Sincronizar tempClientId cuando se carga una cotización existente
  React.useEffect(() => {
    if (clientId !== tempClientId) {
      setTempClientId(clientId);
    }
  }, [clientId, tempClientId]);

  // Hook: Formulario del item actual
  const {
    currentItem,
    setCurrentItem,
    editingItemId,
    handleItemChange,
    addAdditionalPiece,
    removeAdditionalPiece,
    handleAdditionalPieceChange,
    resetItemForm,
    loadItemForEdit,
  } = useItemForm({ mainQuotationName, plateSizes, machineTypes });

  // Hook: Auto-cálculo de talonarios
  useTalonarios({ currentItem, setCurrentItem });

  // Hook: Cálculos del item actual
  const itemResult = useItemCalculations({
    currentItem,
    paperTypes,
    plateSizes,
    machineTypes,
    finishingPrices,
    profitPercentage,
  });

  // Handler: Agregar o actualizar item
  const handleAddOrUpdateItem = useCallback(() => {
    const result = addOrUpdateItem(currentItem, itemResult, editingItemId);

    if (result.success) {
      resetItemForm();
      if (result.message) {
        setModalMessage(result.message);
      }
    } else {
      setModalMessage(result.message);
    }
  }, [currentItem, itemResult, editingItemId, addOrUpdateItem, resetItemForm]);

  // Handler: Editar item existente
  const handleEditItem = useCallback(
    (item) => {
      loadItemForEdit(item);
    },
    [loadItemForEdit]
  );

  // Handler: Guardar cotización
  const handleSaveQuotation = useCallback(async () => {
    const result = await saveQuotation();
    setModalMessage(result.message);
    if (result.shouldReset) {
      resetQuotation();
      resetItemForm();
    }
  }, [saveQuotation, resetQuotation, resetItemForm]);

  // Handler: Actualizar cotización
  const handleUpdateQuotation = useCallback(async () => {
    const result = await updateQuotation();
    setModalMessage(result.message);
    if (result.shouldReset) {
      resetQuotation();
      resetItemForm();
    }
  }, [updateQuotation, resetQuotation, resetItemForm]);

  // Handler: Cancelar edición
  const handleCancelEdit = useCallback(() => {
    resetQuotation();
    resetItemForm();
  }, [resetQuotation, resetItemForm]);

  // Handler: Vista previa
  const handleShowPreview = useCallback(() => {
    if (items.length === 0) {
      setModalMessage(MESSAGES.ERROR_NO_ITEMS_PREVIEW);
      return;
    }
    setShowPreviewModal(true);
  }, [items]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      {/* Modales */}
      <ModalMessage
        message={modalMessage}
        onClose={() => setModalMessage("")}
      />

      {showPreviewModal && (
        <QuotationPreviewModal
          paperTypes={paperTypes}
          quotationData={{
            quotationName: mainQuotationName,
            clientName,
            items,
            date: new Date().toLocaleDateString("es-VE"),
            bcvRate,
            ...grandTotals,
          }}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      <CostBreakdownModal
        item={breakdownModalItem}
        onClose={() => setBreakdownModalItem(null)}
      />

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        {/* Título */}
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-4">
          {editingQuotationId
            ? "Editando Presupuesto"
            : "Calculadora de Litografía"}
        </h2>

        {/* Header con nombre de cotización y cliente */}
        <QuotationHeader
          mainQuotationName={mainQuotationName}
          setMainQuotationName={setMainQuotationName}
          clientId={clientId}
          setClientId={setClientId}
          setClientName={setClientName}
          clients={clients}
          isEditing={!!editingQuotationId}
        />

        {/* Grid de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel izquierdo: Formulario del item */}
          <ItemFormPanel
            currentItem={currentItem}
            handleItemChange={handleItemChange}
            addAdditionalPiece={addAdditionalPiece}
            removeAdditionalPiece={removeAdditionalPiece}
            handleAdditionalPieceChange={handleAdditionalPieceChange}
            paperTypes={paperTypes}
            plateSizes={plateSizes}
            machineTypes={machineTypes}
            itemResult={itemResult}
            layoutInfo={itemResult.layoutInfo}
            troquelLayoutInfo={itemResult.troquelLayoutInfo}
            editingItemId={editingItemId}
            onAddOrUpdate={handleAddOrUpdateItem}
          />

          {/* Panel derecho: Items y totales */}
          <ResultsPanel
            items={items}
            grandTotals={grandTotals}
            bcvRate={bcvRate}
            editingQuotationId={editingQuotationId}
            onEditItem={handleEditItem}
            onRemoveItem={removeItem}
            onShowBreakdown={setBreakdownModalItem}
            onSave={handleSaveQuotation}
            onUpdate={handleUpdateQuotation}
            onCancel={handleCancelEdit}
            onPreview={handleShowPreview}
          />
        </div>
      </div>
    </div>
  );
}

export default QuotationCalculator;
