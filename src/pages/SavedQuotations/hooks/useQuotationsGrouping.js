import { useMemo } from "react";
import { groupQuotationsByClient } from "../utils/quotationUtils";

/**
 * Hook para agrupar cotizaciones por cliente
 */
export const useQuotationsGrouping = (quotations) => {
  // Agrupar cotizaciones usando useMemo para optimización
  const groupedQuotations = useMemo(() => {
    return groupQuotationsByClient(quotations);
  }, [quotations]);

  // Calcular totales por cliente
  const totalByClient = useMemo(() => {
    return Object.keys(groupedQuotations).reduce((acc, clientName) => {
      acc[clientName] = {
        totalUSD: groupedQuotations[clientName].totalUSD,
        totalBs: groupedQuotations[clientName].totalBs,
        count: groupedQuotations[clientName].count,
      };
      return acc;
    }, {});
  }, [groupedQuotations]);

  // Obtener array de nombres de clientes ordenados
  const clientNames = useMemo(() => {
    return Object.keys(groupedQuotations);
  }, [groupedQuotations]);

  return {
    groupedQuotations,
    totalByClient,
    clientNames,
  };
};
