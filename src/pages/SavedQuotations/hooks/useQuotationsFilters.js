import { useState, useMemo } from "react";
import { filterBySearch, filterByDateRange } from "../utils/quotationUtils";

/**
 * Hook para gestionar filtros de cotizaciones (fecha y búsqueda)
 */
export const useQuotationsFilters = (quotations) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Aplicar filtros de forma combinada con useMemo para optimización
  const filteredQuotations = useMemo(() => {
    let filtered = quotations;

    // Aplicar filtro de fechas
    filtered = filterByDateRange(filtered, startDate, endDate);

    // Aplicar filtro de búsqueda
    filtered = filterBySearch(filtered, searchQuery);

    return filtered;
  }, [quotations, startDate, endDate, searchQuery]);

  // Verificar si hay filtros activos
  const hasActiveFilters = startDate || endDate || searchQuery;

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    filteredQuotations,
    hasActiveFilters,
    clearAllFilters,
  };
};
