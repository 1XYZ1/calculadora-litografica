import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFirebase } from "../../context/FirebaseContext";
import QuotationPreviewModal from "../../components/QuotationPreviewModal";
import ToastContainer from "../../components/ToastContainer";
import QuotationInitialScreen from "./components/QuotationInitialScreen";
import QuotationHeader from "./components/QuotationHeader";
import PriceProfileIndicator from "./components/PriceProfileIndicator";
import CalculatorHome from "./components/CalculatorHome";
import {
  StepperHeader,
  StepNavigationButtons,
  Step1Complete,
  Step2MaterialsFinishing,
  Step3ItemSummary,
  Step4QuotationSummary,
} from "./components/Stepper";
import { useDynamicPriceData } from "./hooks/useDynamicPriceData";
import { useItemCalculations } from "./hooks/useItemCalculations";
import { useItemForm } from "./hooks/useItemForm";
import { useQuotation } from "./hooks/useQuotation";
import { useTalonarios } from "./hooks/useTalonarios";
import { useClients } from "../../context/ClientsContext";
import { useStepperNavigation } from "./hooks/useStepperNavigation";
import { useStepValidation } from "./hooks/useStepValidation";
import { useToast } from "./hooks/useToast";
import { MESSAGES } from "../../utils/constants";

/**
 * Componente principal de la calculadora de cotizaciones
 * Orquesta todos los hooks y componentes especializados
 */
function QuotationCalculator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { db, appId, userId } = useFirebase();

  // Obtener cotización cargada desde el estado de navegación (si viene de SavedQuotations o Templates)
  const loadedQuotationFromState = location.state?.quotation || null;
  const preselectedClientId = location.state?.preselectedClientId || null;
  const [loadedQuotation, setLoadedQuotation] = useState(loadedQuotationFromState);

  // Hook: Sistema de notificaciones Toast
  const { toasts, showToast, removeToast } = useToast();

  // Estados de modales y carga
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // Hook: Navegación del stepper
  const {
    currentStep,
    goToStep,
    nextStep,
    previousStep,
    canNavigateToStep,
    completedSteps,
    markStepComplete,
  } = useStepperNavigation();

  // Hook: Validación de pasos
  const { validateStep, getStepErrors } = useStepValidation();

  // Handler: Agregar item al presupuesto (desde Paso 3)
  const handleAddItemToQuotation = useCallback(() => {
    const result = addOrUpdateItem(currentItem, itemResult, editingItemId);

    if (result.success) {
      showToast(
        editingItemId
          ? "Item actualizado exitosamente"
          : "Item agregado al presupuesto",
        "success"
      );
      resetItemForm();
      goToStep(4); // Ir al resumen de cotización (Paso 4)
    } else {
      showToast(result.message, "error");
    }
  }, [
    currentItem,
    itemResult,
    editingItemId,
    addOrUpdateItem,
    resetItemForm,
    showToast,
    goToStep,
  ]);

  // Handler: Volver a la pantalla inicial (al guardar o cancelar)
  const handleReturnToInitialScreen = useCallback(() => {
    resetQuotation();
    resetItemForm();
    goToStep(1);
    navigate('/calculator'); // Navegar de vuelta al home
  }, [resetQuotation, resetItemForm, goToStep, navigate]);

  // Handler: Comenzar cotización desde la pantalla inicial
  const handleBeginQuotation = useCallback(() => {
    if (mainQuotationName.trim() === "" || !clientId) {
      showToast(
        "Debes completar el nombre del presupuesto y seleccionar un cliente",
        "error"
      );
      return;
    }
    // Navegar a la ruta de edición (stepper)
    navigate('/calculator/edit');
  }, [mainQuotationName, clientId, showToast, navigate]);

  // Handler: Editar item existente (desde Paso 6)
  const handleEditItem = useCallback(
    (item) => {
      loadItemForEdit(item);
      goToStep(1); // Volver al paso 1 para editar
      showToast(
        "Editando item. Modifica los valores y guarda los cambios.",
        "info"
      );
    },
    [loadItemForEdit, goToStep, showToast]
  );

  // Handler: Guardar cotización
  const handleSaveQuotation = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await saveQuotation();
      showToast(result.message, result.success ? "success" : "error");
      if (result.shouldReset) {
        handleReturnToInitialScreen();
      }
    } finally {
      setIsSaving(false);
    }
  }, [saveQuotation, showToast, handleReturnToInitialScreen]);

  // Handler: Actualizar cotización
  const handleUpdateQuotation = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await updateQuotation();
      showToast(result.message, result.success ? "success" : "error");
      if (result.shouldReset) {
        handleReturnToInitialScreen();
      }
    } finally {
      setIsSaving(false);
    }
  }, [updateQuotation, showToast, handleReturnToInitialScreen]);

  // Handler: Cancelar edición
  const handleCancelEdit = useCallback(() => {
    resetQuotation();
    resetItemForm();
    setLoadedQuotation(null);
    showToast(
      "Edición cancelada. Redirigiendo a Cotizaciones Guardadas...",
      "info"
    );
    setTimeout(() => {
      navigate("/quotations");
    }, 500);
  }, [
    resetQuotation,
    resetItemForm,
    showToast,
    navigate,
  ]);

  // Handler: Vista previa
  const handleShowPreview = useCallback(() => {
    if (items.length === 0) {
      showToast(MESSAGES.ERROR_NO_ITEMS_PREVIEW, "error");
      return;
    }
    setShowPreviewModal(true);
  }, [items, showToast]);

  // Handler: Navegación entre pasos con validación
  const handleNextStep = useCallback(() => {
    const errors = validateStep(currentStep, currentItem, items);

    if (errors.length > 0) {
      // Mostrar primer error
      showToast(errors[0], "error");
      return;
    }

    // Marcar paso como completado
    markStepComplete(currentStep);

    // Avanzar al siguiente paso (ya no hay skip automático)
    nextStep();
  }, [
    currentStep,
    currentItem,
    items,
    validateStep,
    showToast,
    markStepComplete,
    nextStep,
  ]);

  // Handler: Navegar al paso anterior
  const handlePreviousStep = useCallback(() => {
    previousStep();
  }, [previousStep]);

  // Auto-scroll al cargar una cotización para editar
  useEffect(() => {
    if (editingQuotationId && items.length > 0) {
      navigate('/calculator/edit', { replace: true }); // Asegurar que está en ruta edit
      goToStep(4); // Ir directo al resumen (Paso 4) si está editando
    }
  }, [editingQuotationId, items.length, goToStep, navigate]);

  // Detectar si se cargó una cotización desde el estado de navegación
  useEffect(() => {
    if (loadedQuotationFromState) {
      navigate('/calculator/edit', { replace: true }); // Ya tiene datos cargados, ir a stepper
    }
  }, [loadedQuotationFromState, navigate]);

  // Detectar si viene un cliente pre-seleccionado (desde creación de cliente nuevo)
  useEffect(() => {
    if (preselectedClientId && location.pathname === '/calculator/config') {
      setClientId(preselectedClientId);
    }
  }, [preselectedClientId, location.pathname, setClientId]);

  // Ref para el contenedor de pasos (para auto-scroll y focus)
  const stepContainerRef = React.useRef(null);

  // Auto-scroll y focus al cambiar de paso
  useEffect(() => {
    if (stepContainerRef.current) {
      // Scroll suave al inicio del contenedor
      stepContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Focus en el primer input del paso (después del scroll)
      setTimeout(() => {
        const firstInput = stepContainerRef.current.querySelector(
          'input:not([type="checkbox"]):not([type="radio"]), select, textarea'
        );
        if (firstInput) {
          firstInput.focus();
        }
      }, 300);
    }
  }, [currentStep]);

  // Renderizar el paso actual (4 pasos)
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: // Información Básica + Configuración de Impresión
        return (
          <Step1Complete
            currentItem={currentItem}
            handleItemChange={handleItemChange}
            addAdditionalPiece={addAdditionalPiece}
            removeAdditionalPiece={removeAdditionalPiece}
            handleAdditionalPieceChange={handleAdditionalPieceChange}
          />
        );
      case 2: // Materiales/Equipos + Acabados
        return (
          <Step2MaterialsFinishing
            currentItem={currentItem}
            handleItemChange={handleItemChange}
            paperTypes={paperTypes}
            plateSizes={plateSizes}
            machineTypes={machineTypes}
          />
        );
      case 3: // Resumen del Item
        return (
          <Step3ItemSummary
            currentItem={currentItem}
            itemResult={itemResult}
            layoutInfo={itemResult.layoutInfo}
            troquelLayoutInfo={itemResult.troquelLayoutInfo}
            onAddItemToQuotation={handleAddItemToQuotation}
            editingItemId={editingItemId}
          />
        );
      case 4: // Resumen de Cotización
        return (
          <Step4QuotationSummary
            items={items}
            grandTotals={grandTotals}
            bcvRate={bcvRate}
            editingQuotationId={editingQuotationId}
            onEditItem={handleEditItem}
            onRemoveItem={removeItem}
            onSave={handleSaveQuotation}
            onUpdate={handleUpdateQuotation}
            onCancel={handleCancelEdit}
            onPreview={handleShowPreview}
            onAddNewItem={() => {
              resetItemForm();
              goToStep(1);
            }}
            isSaving={isSaving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-0 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen font-inter">
      {/* Sistema de notificaciones Toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Modal de vista previa */}
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

      {/* Renderizar según la ruta actual */}
      {location.pathname === '/calculator' && <CalculatorHome />}

      {location.pathname === '/calculator/config' && (
        <QuotationInitialScreen
          mainQuotationName={mainQuotationName}
          setMainQuotationName={setMainQuotationName}
          clientId={clientId}
          setClientId={setClientId}
          setClientName={setClientName}
          onBeginQuotation={handleBeginQuotation}
          onNavigateToClients={() => navigate("/clients")}
        />
      )}

      {location.pathname === '/calculator/edit' && (
        /* Contenedor principal del Stepper */
        <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-none sm:rounded-2xl shadow-xl">
          {/* Botón volver a configuración - Solo en paso 1 */}
          {currentStep === 1 && (
            <div className="mb-4">
              <button
                onClick={() => navigate('/calculator/config')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Volver a configuración</span>
              </button>
            </div>
          )}

          {/* Título */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 text-center mb-4 sm:mb-6">
            {editingQuotationId
              ? "Editando Presupuesto"
              : "Calculadora de Litografía"}
          </h2>

          {/* Header con nombre de cotización y cliente - Solo mostrar en paso 4 (resumen final) */}
          {currentStep === 4 && (
            <QuotationHeader
              mainQuotationName={mainQuotationName}
              setMainQuotationName={setMainQuotationName}
              clientId={clientId}
              setClientId={setClientId}
              setClientName={setClientName}
              clients={clients}
              isEditing={!!editingQuotationId}
            />
          )}

          {/* Indicador de perfil de precios - Mostrar en todos los pasos del stepper */}
          {clientId && clientName && (
            <div className="mb-4">
              <PriceProfileIndicator clientId={clientId} clientName={clientName} />
            </div>
          )}

          {/* Stepper Header - No mostrar en paso 4 (resumen final) */}
          {currentStep < 4 && (
            <StepperHeader
              currentStep={currentStep}
              completedSteps={completedSteps}
              canNavigateToStep={canNavigateToStep}
              onStepClick={goToStep}
            />
          )}

          {/* Contenido del paso actual con animaciones */}
          <div
            ref={stepContainerRef}
            className="mt-4 sm:mt-6 lg:mt-8 mb-4 sm:mb-6 animate-fadeIn"
            key={currentStep}
          >
            {renderCurrentStep()}
          </div>

          {/* Botones de navegación - Pasos 1, 2 y 3 */}
          {currentStep <= 3 && (
            <StepNavigationButtons
              currentStep={currentStep}
              onPrevious={handlePreviousStep}
              onNext={handleNextStep}
              isFirstStep={currentStep === 1}
              isLastStep={false}
              isValid={true}
              customNextAction={
                currentStep === 3 ? handleAddItemToQuotation : null
              }
              customNextLabel={
                currentStep === 3
                  ? editingItemId
                    ? "Actualizar Item"
                    : "Agregar Item"
                  : null
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

export default QuotationCalculator;
