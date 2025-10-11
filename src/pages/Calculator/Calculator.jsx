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
import { usePriceProfilesList } from "../PriceProfiles/hooks/usePriceProfilesList";
import { MESSAGES, TROQUELADO_SEPARATION, PAPER_TYPE_OPTIONS } from "../../utils/constants";
import {
  getSheetDimensions,
  calculateDigitalCost,
  calculateOffsetCost,
  calculateFinishingCosts,
  calculateAdditionalPiecesYield,
  calculateTotalWithProfit,
} from "../../utils/calculationEngine";
import { calculateBestFit } from "../../utils/calculations";

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
  const templateDataFromState = location.state?.templateData || null;
  const navigationMode = location.state?.mode || 'normal';
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

  // Hook: Cargar perfiles de precio
  const { profiles: priceProfiles } = usePriceProfilesList();

  // Estado temporal para clientId (se sincroniza con useQuotation)
  const [tempClientId, setTempClientId] = useState(null);

  // Estado para perfil de precio seleccionado (para templates)
  const [selectedPriceProfileId, setSelectedPriceProfileId] = useState(null);

  // Ref para controlar si ya se re-calcularon los items (evita re-cálculos infinitos)
  const hasRecalculatedItems = React.useRef(false);

  // Hook: Cargar datos de precios dinámicos basados en el cliente seleccionado
  // Si hay un selectedPriceProfileId (desde template), usarlo en lugar del perfil del cliente
  const {
    papers: paperTypes,
    plateSizes,
    machineTypes,
    finishingPrices,
    settings,
    loading: pricesLoading,
  } = useDynamicPriceData(tempClientId, selectedPriceProfileId);

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
    setItems, // Necesario para re-calcular items desde templates
    grandTotals,
    editingQuotationId,
    addOrUpdateItem,
    editItem,
    removeItem,
    resetQuotation,
    saveQuotation,
    updateQuotation,
    loadFromTemplate,
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
    hasRecalculatedItems.current = false; // Resetear flag de re-cálculo
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

    // Si viene de template, validar perfil de precio y cargar items
    if (navigationMode === 'from-template' && templateDataFromState) {
      if (!selectedPriceProfileId) {
        showToast(
          "Debes seleccionar un perfil de precio",
          "error"
        );
        return;
      }

      // Cargar items de la plantilla con el nuevo cliente y perfil de precio
      loadFromTemplate(
        templateDataFromState,
        clientId,
        clientName,
        selectedPriceProfileId,
        mainQuotationName
      );

      // Navegar a la ruta de edición y después ir al paso 4
      navigate('/calculator/edit');
      // El useEffect detectará los items cargados y navegará al paso 4
      setTimeout(() => {
        goToStep(4);
      }, 100);
    } else {
      // Flujo normal: navegar al stepper en paso 1
      navigate('/calculator/edit');
    }
  }, [
    mainQuotationName,
    clientId,
    clientName,
    selectedPriceProfileId,
    navigationMode,
    templateDataFromState,
    loadFromTemplate,
    goToStep,
    showToast,
    navigate
  ]);

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
      // Distinguir entre edición y template
      if (location.state?.fromTemplate) {
        // Ya no debería llegar aquí - TemplateSelector ahora navega a /config
        console.warn('Template flow should go through /config first');
      } else {
        // Edición normal de cotización existente
        navigate('/calculator/edit', { replace: true });
      }
    }
  }, [loadedQuotationFromState, location.state, navigate]);

  // Detectar si viene un cliente pre-seleccionado (desde creación de cliente nuevo)
  useEffect(() => {
    if (preselectedClientId && location.pathname === '/calculator/config') {
      setClientId(preselectedClientId);
    }
  }, [preselectedClientId, location.pathname, setClientId]);

  // Resetear flag de re-cálculo cuando cambia el perfil seleccionado (permite múltiples cambios)
  useEffect(() => {
    if (selectedPriceProfileId && location.pathname === '/calculator/config') {
      hasRecalculatedItems.current = false;
      console.log('🔄 Flag de re-cálculo reseteado por cambio de perfil');
    }
  }, [selectedPriceProfileId, location.pathname]);

  // Re-calcular items cuando cambia el perfil de precio (importante para templates)
  useEffect(() => {
    // Solo re-calcular si:
    // 1. Hay items cargados
    // 2. Hay un selectedPriceProfileId
    // 3. Los datos de precios ya están cargados
    // 4. Estamos en modo template
    // 5. NO se han re-calculado antes (evitar loops)
    if (
      items.length > 0 &&
      selectedPriceProfileId &&
      !pricesLoading &&
      navigationMode === 'from-template' &&
      !hasRecalculatedItems.current &&
      paperTypes.length > 0 && // Asegurar que los precios estén cargados
      plateSizes.length > 0 &&
      machineTypes.length > 0 &&
      Object.keys(finishingPrices).length > 0
    ) {
      console.log('🔄 Re-calculando items con nuevo perfil de precio:', selectedPriceProfileId);
      console.log('📦 Materiales disponibles:', {
        papers: paperTypes.length,
        plates: plateSizes.length,
        machines: machineTypes.length,
        finishing: Object.keys(finishingPrices).length
      });

      let hasRemappedMaterials = false;

      // Re-calcular cada item con los nuevos precios
      const recalculatedItems = items.map((item, index) => {
        const {
          totalPieces,
          pieceWidthCm,
          pieceHeightCm,
          printingAreaOption,
          isDigitalDuplex,
          isTroqueladoSelected,
          sobrantePliegos,
          numColorsTiro,
          isTiroRetiro,
          numColorsRetiro,
          isWorkAndTurn,
          additionalPieces = [],
        } = item;

        let selectedPaperTypeId = item.selectedPaperTypeId;
        let selectedPlateSizeId = item.selectedPlateSizeId;
        let selectedMachineTypeId = item.selectedMachineTypeId;

        // **MAPEO INTELIGENTE POR NOMBRE DE MATERIAL**
        // En lugar de solo verificar IDs, intentamos encontrar el material equivalente por nombre

        // Mapear papel: buscar por nombre/tipo en el nuevo perfil
        if (selectedPaperTypeId && paperTypes.length > 0) {
          // Buscar el papel original para obtener su nombre/tipo
          const originalPaper = items.flatMap(() => paperTypes).find(p => p.id === selectedPaperTypeId);
          const paperExists = paperTypes.some(p => p.id === selectedPaperTypeId);

          if (!paperExists) {
            // El ID no existe - buscar equivalente por nombre
            if (originalPaper && originalPaper.name) {
              const equivalentPaper = paperTypes.find(p =>
                p.name && p.name.toLowerCase().includes(originalPaper.name.toLowerCase().split(' ')[0])
              );

              if (equivalentPaper) {
                selectedPaperTypeId = equivalentPaper.id;
                console.log(`✓ Item ${index + 1}: Papel mapeado a "${equivalentPaper.name}"`);
                hasRemappedMaterials = true;
              } else {
                // No se encontró equivalente - usar el primero disponible
                selectedPaperTypeId = paperTypes[0].id;
                console.warn(`⚠️ Item ${index + 1}: Papel "${originalPaper.name}" no encontrado, usando "${paperTypes[0].name}"`);
                hasRemappedMaterials = true;
              }
            } else {
              // No hay info del papel original - usar el primero
              selectedPaperTypeId = paperTypes[0].id;
              hasRemappedMaterials = true;
            }
          }
        } else if (!selectedPaperTypeId && paperTypes.length > 0) {
          // No había papel seleccionado - asignar el primero
          selectedPaperTypeId = paperTypes[0].id;
        }

        // Mapear plancha: buscar por tamaño
        if (selectedPlateSizeId && plateSizes.length > 0) {
          const plateExists = plateSizes.some(p => p.id === selectedPlateSizeId);

          if (!plateExists) {
            const originalPlate = items.flatMap(() => plateSizes).find(p => p.id === selectedPlateSizeId);

            if (originalPlate && originalPlate.size) {
              const equivalentPlate = plateSizes.find(p =>
                p.size && p.size.toLowerCase() === originalPlate.size.toLowerCase()
              );

              if (equivalentPlate) {
                selectedPlateSizeId = equivalentPlate.id;
                console.log(`✓ Item ${index + 1}: Plancha mapeada a "${equivalentPlate.size}"`);
                hasRemappedMaterials = true;
              } else {
                selectedPlateSizeId = plateSizes[0].id;
                console.warn(`⚠️ Item ${index + 1}: Plancha "${originalPlate.size}" no encontrada`);
                hasRemappedMaterials = true;
              }
            } else {
              selectedPlateSizeId = plateSizes[0].id;
              hasRemappedMaterials = true;
            }
          }
        } else if (!selectedPlateSizeId && plateSizes.length > 0) {
          selectedPlateSizeId = plateSizes[0].id;
        }

        // Mapear máquina: buscar por tipo
        if (selectedMachineTypeId && machineTypes.length > 0) {
          const machineExists = machineTypes.some(m => m.id === selectedMachineTypeId);

          if (!machineExists) {
            const originalMachine = items.flatMap(() => machineTypes).find(m => m.id === selectedMachineTypeId);

            if (originalMachine && originalMachine.type) {
              const equivalentMachine = machineTypes.find(m =>
                m.type && m.type.toLowerCase() === originalMachine.type.toLowerCase()
              );

              if (equivalentMachine) {
                selectedMachineTypeId = equivalentMachine.id;
                console.log(`✓ Item ${index + 1}: Máquina mapeada a "${equivalentMachine.type}"`);
                hasRemappedMaterials = true;
              } else {
                selectedMachineTypeId = machineTypes[0].id;
                console.warn(`⚠️ Item ${index + 1}: Máquina "${originalMachine.type}" no encontrada`);
                hasRemappedMaterials = true;
              }
            } else {
              selectedMachineTypeId = machineTypes[0].id;
              hasRemappedMaterials = true;
            }
          }
        } else if (!selectedMachineTypeId && machineTypes.length > 0) {
          selectedMachineTypeId = machineTypes[0].id;
        }

        const pieces = parseFloat(totalPieces) || 0;
        const pWidth = parseFloat(pieceWidthCm);
        const pHeight = parseFloat(pieceHeightCm);
        const hasCustomDimensions = pWidth > 0 && pHeight > 0;

        if (!pieces || !printingAreaOption) {
          return {
            ...item,
            selectedPaperTypeId,
            selectedPlateSizeId,
            selectedMachineTypeId,
          }; // Mantener item con IDs actualizados
        }

        const sheetConfig = getSheetDimensions(printingAreaOption);
        const separation = isTroqueladoSelected ? TROQUELADO_SEPARATION : 0;
        const fit = hasCustomDimensions
          ? calculateBestFit(pWidth, pHeight, sheetConfig.width, sheetConfig.height, separation)
          : { count: 1 };

        let costResult = {};

        // Re-calcular según tipo (digital u offset)
        if (sheetConfig.isDigital) {
          costResult = calculateDigitalCost({
            pieces,
            fit,
            isDigitalDuplex,
            finishingPrices,
          });
        } else {
          costResult = calculateOffsetCost({
            pieces,
            fit,
            numColorsTiro,
            numColorsRetiro,
            isTiroRetiro,
            isWorkAndTurn,
            sobrantePliegos,
            selectedPaperTypeId,
            selectedPlateSizeId,
            selectedMachineTypeId,
            paperTypes,
            plateSizes,
            machineTypes,
          });
        }

        // Re-calcular acabados
        const finishingResult = calculateFinishingCosts({
          ...item,
          ...costResult,
          finishingPrices,
        });

        // Re-calcular piezas adicionales con el ID actualizado
        const additionalPiecesResult = calculateAdditionalPiecesYield({
          additionalPieces,
          fit,
          selectedPaperTypeId,
          paperTypes,
        });

        // Re-calcular total con ganancia
        const totalResult = calculateTotalWithProfit({
          ...costResult,
          ...finishingResult,
          ...additionalPiecesResult,
          profitPercentage: settings.profit || 0,
        });

        // Retornar item actualizado con nuevos cálculos Y IDs validados
        return {
          ...item,
          selectedPaperTypeId,
          selectedPlateSizeId,
          selectedMachineTypeId,
          ...costResult,
          ...finishingResult,
          ...additionalPiecesResult,
          ...totalResult,
        };
      });

      // Actualizar los items con los nuevos cálculos
      setItems(recalculatedItems);
      hasRecalculatedItems.current = true; // Marcar como re-calculado

      console.log('✅ Items re-calculados exitosamente');

      // Mostrar advertencia si hubo materiales re-mapeados
      if (hasRemappedMaterials) {
        showToast(
          'Se han actualizado los materiales con el nuevo perfil de precio. Por favor, revisa los items.',
          'info'
        );
      }
    }
  }, [selectedPriceProfileId, pricesLoading, navigationMode, paperTypes, plateSizes, machineTypes, finishingPrices, settings.profit, items.length, showToast]);
  // NOTA: No incluir 'items' ni 'setItems' en las dependencias para evitar loop infinito

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
          templateData={templateDataFromState}
          mode={navigationMode}
          priceProfiles={priceProfiles}
          selectedPriceProfileId={selectedPriceProfileId}
          setSelectedPriceProfileId={setSelectedPriceProfileId}
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
