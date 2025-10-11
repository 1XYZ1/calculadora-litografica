import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../../context/FirebaseContext";
import ModalMessage from "../../components/ModalMessage";
import ConfirmationModal from "../../components/ConfirmationModal";

// Hooks
import { useQuotationsFetching } from "./hooks/useQuotationsFetching";
import { useQuotationsFilters } from "./hooks/useQuotationsFilters";
import { useQuotationsGrouping } from "./hooks/useQuotationsGrouping";
import { useQuotationsDeletion } from "./hooks/useQuotationsDeletion";
import { useQuotationDuplication } from "./hooks/useQuotationDuplication";
import { useNotification } from "./hooks/useNotification";
import { useStatusChange } from "./hooks/useStatusChange";
import { useClients } from "../../context/ClientsContext";
import { useQuotationTemplates } from "../../hooks/useQuotationTemplates";

// Componentes
import SavedQuotationsHeader from "./components/SavedQuotationsHeader";
import SearchBar from "./components/SearchBar";
import QuotationsListByClient from "./components/QuotationsListByClient";
import DuplicateQuotationModal from "./components/DuplicateQuotationModal";
import EmptyState from "./components/EmptyState";
import LoadingSkeleton from "./components/LoadingSkeleton";
import TemplatesSection from "./components/TemplatesSection";

/**
 * Componente principal de cotizaciones guardadas
 * Orquesta todos los hooks y componentes especializados
 */
export default function SavedQuotations() {
  const navigate = useNavigate();
  const { db, appId, userId } = useFirebase();

  // Hook: Cargar cotizaciones desde Firestore
  const { quotations, loading, error } = useQuotationsFetching({
    db,
    appId,
    userId,
  });

  // Hook: Cargar lista de clientes
  const { clients } = useClients();

  // Hook: Gestión de filtros (cliente)
  const {
    selectedClientId,
    setSelectedClientId,
    filteredQuotations,
    hasActiveFilters,
    clearAllFilters,
  } = useQuotationsFilters(quotations);

  // Separar plantillas de cotizaciones regulares
  const regularQuotations = useMemo(() => {
    return filteredQuotations.filter(q => !q.isTemplate);
  }, [filteredQuotations]);

  // Hook: Agrupamiento por cliente (solo cotizaciones regulares)
  const { groupedQuotations } = useQuotationsGrouping(regularQuotations);

  // Hook: Notificaciones (debe estar ANTES de usarse en otros handlers)
  const { message, showSuccess, showError, clearMessage } = useNotification();

  // Hook: Plantillas
  const {
    templates,
    loading: templatesLoading,
    markAsTemplate,
    unmarkAsTemplate,
    updateTemplateName,
  } = useQuotationTemplates();

  // Handler: Cargar cotización para editar
  const handleLoadQuotation = useCallback((quotation) => {
    navigate("/calculator", { state: { quotation } });
  }, [navigate]);

  // Handler: Toggle template
  const handleToggleTemplate = useCallback(async (quotationId, templateName) => {
    try {
      const quotation = quotations.find(q => q.id === quotationId);
      if (!quotation) return;

      if (quotation.isTemplate) {
        await unmarkAsTemplate(quotationId);
        showSuccess("Plantilla desmarcada exitosamente");
      } else {
        await markAsTemplate(quotationId, templateName || quotation.name);
        showSuccess("Cotización marcada como plantilla");
      }
    } catch (error) {
      showError("Error al cambiar estado de plantilla");
    }
  }, [quotations, markAsTemplate, unmarkAsTemplate, showSuccess, showError]);

  // Handler: Actualizar nombre de plantilla
  const handleUpdateTemplateName = useCallback(async (quotationId, newName) => {
    try {
      await updateTemplateName(quotationId, newName);
      showSuccess("Nombre de plantilla actualizado");
    } catch (error) {
      showError("Error al actualizar nombre de plantilla");
    }
  }, [updateTemplateName, showSuccess, showError]);

  // Hook: Cambio de estado
  const { changeStatus } = useStatusChange({
    db,
    appId,
    userId,
    onSuccess: showSuccess,
    onError: showError,
  });

  // Hook: Eliminación
  const {
    confirmDeleteSingle,
    executeDelete,
    cancelDelete,
    confirmModalState,
  } = useQuotationsDeletion({
    db,
    appId,
    userId,
    onSuccess: showSuccess,
    onError: showError,
  });

  // Hook: Duplicación
  const {
    confirmDuplicate,
    cancelDuplicate,
    executeDuplicate,
    duplicating,
    modalState: duplicateModalState,
  } = useQuotationDuplication({
    db,
    appId,
    userId,
    onSuccess: showSuccess,
    onError: showError,
  });

  // Mostrar error de Firestore si existe
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center text-red-600">
            <p className="text-xl font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Modales */}
      <ModalMessage message={message} onClose={clearMessage} />

      {confirmModalState && (
        <ConfirmationModal
          message={confirmModalState.message}
          onConfirm={executeDelete}
          onCancel={cancelDelete}
        />
      )}

      {duplicateModalState && (
        <DuplicateQuotationModal
          isOpen={!!duplicateModalState}
          onClose={cancelDuplicate}
          onConfirm={executeDuplicate}
          quotation={duplicateModalState.quotation}
          clients={clients}
        />
      )}

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-none sm:rounded-2xl shadow-xl">
        <SavedQuotationsHeader totalCount={filteredQuotations.length} />

        {/* Filtros */}
        <SearchBar
          selectedClientId={selectedClientId}
          onClientFilterChange={setSelectedClientId}
          clients={clients}
        />

        {/* Botón para limpiar todos los filtros */}
        {hasActiveFilters && (
          <div className="mb-6 text-center">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}

        {/* Contenido principal */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredQuotations.length === 0 ? (
          <EmptyState isFiltered={hasActiveFilters} />
        ) : (
          <>
            {/* Sección de Plantillas */}
            {!hasActiveFilters && templates && templates.length > 0 && (
              <TemplatesSection
                templates={templates}
                onEdit={handleLoadQuotation}
                onDelete={confirmDeleteSingle}
                onDuplicate={confirmDuplicate}
                onToggleTemplate={handleToggleTemplate}
                onUpdateTemplateName={handleUpdateTemplateName}
                currency="USD"
                showBolivars={true}
              />
            )}

            {/* Cotizaciones regulares */}
            <QuotationsListByClient
              groupedQuotations={groupedQuotations}
              onEdit={handleLoadQuotation}
              onDelete={confirmDeleteSingle}
              onStatusChange={changeStatus}
              onDuplicate={confirmDuplicate}
              onToggleTemplate={handleToggleTemplate}
              onUpdateTemplateName={handleUpdateTemplateName}
            />
          </>
        )}
      </div>
    </div>
  );
}
