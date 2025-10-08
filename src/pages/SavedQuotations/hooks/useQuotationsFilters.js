import { useState, useMemo } from "react";
import { filterBySearch, filterByDateRange } from "../utils/quotationUtils";

/**
 * Hook para gestionar filtros de cotizaciones (fecha, búsqueda y cliente)
 */
export const useQuotationsFilters = (quotations) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  // Aplicar filtros de forma combinada con useMemo para optimización
  const filteredQuotations = useMemo(() => {
    let filtered = quotations;

    // Aplicar filtro de fechas
    filtered = filterByDateRange(filtered, startDate, endDate);

    // Aplicar filtro de búsqueda
    filtered = filterBySearch(filtered, searchQuery);

    // Aplicar filtro de cliente
    if (selectedClientId) {
      filtered = filtered.filter((q) => q.clientId === selectedClientId);
    }

    return filtered;
  }, [quotations, startDate, endDate, searchQuery, selectedClientId]);

  // Verificar si hay filtros activos
  const hasActiveFilters =
    startDate || endDate || searchQuery || selectedClientId;

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setSelectedClientId("");
  };

  return {
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
  };
};
