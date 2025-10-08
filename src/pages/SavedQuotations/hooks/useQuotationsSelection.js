import { useState, useCallback, useEffect } from "react";

/**
 * Hook para gestionar la selección múltiple de cotizaciones
 */
export const useQuotationsSelection = (quotations) => {
  const [selectedQuotations, setSelectedQuotations] = useState([]);

  // Sincronizar selecciones con cotizaciones actuales
  // Remover selecciones de cotizaciones que ya no existen
  useEffect(() => {
    setSelectedQuotations((prev) => {
      const quotationIds = quotations.map((q) => q.id);
      return prev.filter((id) => quotationIds.includes(id));
    });
  }, [quotations]);

  // Alternar selección de una cotización
  const toggleSelect = useCallback((quotationId) => {
    setSelectedQuotations((prev) =>
      prev.includes(quotationId)
        ? prev.filter((id) => id !== quotationId)
        : [...prev, quotationId]
    );
  }, []);

  // Seleccionar todas las cotizaciones
  const selectAll = useCallback(() => {
    setSelectedQuotations(quotations.map((q) => q.id));
  }, [quotations]);

  // Deseleccionar todas
  const deselectAll = useCallback(() => {
    setSelectedQuotations([]);
  }, []);

  // Verificar si hay selecciones
  const hasSelections = selectedQuotations.length > 0;

  return {
    selectedQuotations,
    toggleSelect,
    selectAll,
    deselectAll,
    hasSelections,
  };
};
