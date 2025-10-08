import React, { useCallback } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import ModalMessage from "../../components/ModalMessage";
import ConfirmationModal from "../../components/ConfirmationModal";

// Hooks
import { useQuotationsFetching } from "./hooks/useQuotationsFetching";
import { useQuotationsFilters } from "./hooks/useQuotationsFilters";
import { useQuotationsGrouping } from "./hooks/useQuotationsGrouping";
import { useQuotationsSelection } from "./hooks/useQuotationsSelection";
import { useQuotationsDeletion } from "./hooks/useQuotationsDeletion";
import { useNotification } from "./hooks/useNotification";
import { useClients } from "../../hooks/useClients";

// Componentes
import SavedQuotationsHeader from "./components/SavedQuotationsHeader";
import SearchBar from "./components/SearchBar";
import DateFiltersSection from "./components/DateFiltersSection";
import BulkActionsBar from "./components/BulkActionsBar";
import QuotationsListByClient from "./components/QuotationsListByClient";
import EmptyState from "./components/EmptyState";
import LoadingSkeleton from "./components/LoadingSkeleton";

/**
 * Componente principal de cotizaciones guardadas
 * Orquesta todos los hooks y componentes especializados
 */
export default function SavedQuotations({ onLoadQuotation }) {
  const { db, appId, userId } = useFirebase();

  // Hook: Cargar cotizaciones desde Firestore
  const { quotations, loading, error } = useQuotationsFetching({
    db,
    appId,
    userId,
  });

  // Hook: Cargar lista de clientes
  const { clients } = useClients();

  // Hook: Gestión de filtros (fecha + búsqueda + cliente)
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    selectedClientId,
    setSelectedClientId,
    filteredQuotations,
    hasActiveFilters,
    clearAllFilters,
  } = useQuotationsFilters(quotations);

  // Hook: Agrupamiento por cliente
  const { groupedQuotations } = useQuotationsGrouping(filteredQuotations);

  // Hook: Selección múltiple
  const { selectedQuotations, toggleSelect, selectAll, deselectAll } =
    useQuotationsSelection(filteredQuotations);

  // Hook: Notificaciones
  const { message, showSuccess, showError, clearMessage } = useNotification();

  // Hook: Eliminación
  const {
    confirmDeleteSingle,
    confirmDeleteMultiple,
    executeDelete,
    cancelDelete,
    confirmModalState,
  } = useQuotationsDeletion({
    db,
    appId,
    userId,
    selectedQuotations,
    deselectAll,
    onSuccess: showSuccess,
    onError: showError,
  });

  // Handler: Limpiar búsqueda
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  // Handler: Limpiar filtros de fecha
  const handleClearDateFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
  }, [setStartDate, setEndDate]);

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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Modales */}
      <ModalMessage message={message} onClose={clearMessage} />

      {confirmModalState && (
        <ConfirmationModal
          message={confirmModalState.message}
          onConfirm={executeDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <SavedQuotationsHeader totalCount={filteredQuotations.length} />

        {/* Búsqueda y filtros */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handleClearSearch}
          selectedClientId={selectedClientId}
          onClientFilterChange={setSelectedClientId}
          clients={clients}
        />

        {/* Filtros de fecha */}
        <DateFiltersSection
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClear={handleClearDateFilters}
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

        {/* Acciones masivas */}
        <BulkActionsBar
          selectedCount={selectedQuotations.length}
          totalCount={filteredQuotations.length}
          onDeleteSelected={confirmDeleteMultiple}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
        />

        {/* Contenido principal */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredQuotations.length === 0 ? (
          <EmptyState isFiltered={hasActiveFilters} searchQuery={searchQuery} />
        ) : (
          <QuotationsListByClient
            groupedQuotations={groupedQuotations}
            selectedQuotations={selectedQuotations}
            onToggleSelect={toggleSelect}
            onEdit={onLoadQuotation}
            onDelete={confirmDeleteSingle}
          />
        )}
      </div>
    </div>
  );
}
