import { useState, useMemo } from "react";
import { filterBySearch } from "../utils/quotationUtils";

/**
 * Hook para gestionar filtros de cotizaciones (búsqueda y cliente)
 */
export const useQuotationsFilters = (quotations) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  // Aplicar filtros de forma combinada con useMemo para optimización
  const filteredQuotations = useMemo(() => {
    let filtered = quotations;

    // Aplicar filtro de búsqueda
    filtered = filterBySearch(filtered, searchQuery);

    // Aplicar filtro de cliente
    if (selectedClientId) {
      filtered = filtered.filter((q) => q.clientId === selectedClientId);
    }

    return filtered;
  }, [quotations, searchQuery, selectedClientId]);

  // Verificar si hay filtros activos
  const hasActiveFilters = searchQuery || selectedClientId;

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedClientId("");
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedClientId,
    setSelectedClientId,
    filteredQuotations,
    hasActiveFilters,
    clearAllFilters,
  };
};
