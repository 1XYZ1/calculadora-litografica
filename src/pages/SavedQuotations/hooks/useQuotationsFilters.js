import { useState, useMemo } from "react";

/**
 * Hook para gestionar filtros de cotizaciones (cliente)
 */
export const useQuotationsFilters = (quotations) => {
  const [selectedClientId, setSelectedClientId] = useState("");

  // Aplicar filtros de forma combinada con useMemo para optimización
  const filteredQuotations = useMemo(() => {
    let filtered = quotations;

    // Aplicar filtro de cliente
    if (selectedClientId) {
      filtered = filtered.filter((q) => q.clientId === selectedClientId);
    }

    return filtered;
  }, [quotations, selectedClientId]);

  // Verificar si hay filtros activos
  const hasActiveFilters = selectedClientId;

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedClientId("");
  };

  return {
    selectedClientId,
    setSelectedClientId,
    filteredQuotations,
    hasActiveFilters,
    clearAllFilters,
  };
};
