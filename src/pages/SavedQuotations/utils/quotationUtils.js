import { Timestamp } from "firebase/firestore";

/**
 * Formatear timestamp de Firestore a formato legible
 */
export const formatQuotationDate = (timestamp) => {
  if (!timestamp) return "N/A";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleString("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Filtrar cotizaciones por búsqueda de cliente
 * Búsqueda case-insensitive en el campo clientName
 */
export const filterBySearch = (quotations, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === "") {
    return quotations;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();

  return quotations.filter((quotation) => {
    const clientName = (quotation.clientName || "").toLowerCase();
    return clientName.includes(normalizedQuery);
  });
};

/**
 * Filtrar cotizaciones por rango de fechas
 */
export const filterByDateRange = (quotations, startDate, endDate) => {
  if (!startDate && !endDate) {
    return quotations;
  }

  const startOfDay = startDate ? new Date(startDate) : new Date(0);
  if (startDate) startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = endDate ? new Date(endDate) : new Date();
  if (endDate) endOfDay.setHours(23, 59, 59, 999);

  const startTimestamp = Timestamp.fromDate(startOfDay);
  const endTimestamp = Timestamp.fromDate(endOfDay);

  return quotations.filter((quotation) => {
    if (!quotation.timestamp) return false;

    const quotationTimestamp = quotation.timestamp;
    return (
      quotationTimestamp.seconds >= startTimestamp.seconds &&
      quotationTimestamp.seconds <= endTimestamp.seconds
    );
  });
};

/**
 * Agrupar cotizaciones por clientName
 * Ordena grupos alfabéticamente y cotizaciones por fecha descendente
 */
export const groupQuotationsByClient = (quotations) => {
  // Agrupar por clientName
  const grouped = quotations.reduce((acc, quotation) => {
    const clientName = quotation.clientName || "Sin Cliente";

    if (!acc[clientName]) {
      acc[clientName] = {
        clientName,
        quotations: [],
        totalUSD: 0,
        totalBs: 0,
        count: 0,
      };
    }

    acc[clientName].quotations.push(quotation);
    acc[clientName].count += 1;

    // Sumar totales si existen
    if (quotation.grandTotals) {
      acc[clientName].totalUSD += quotation.grandTotals.totalGeneral || 0;
      acc[clientName].totalBs += quotation.grandTotals.totalCostInBs || 0;
    }

    return acc;
  }, {});

  // Ordenar cotizaciones dentro de cada grupo por timestamp DESC
  Object.keys(grouped).forEach((clientName) => {
    grouped[clientName].quotations.sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA; // Más reciente primero
    });
  });

  // Convertir a array y ordenar alfabéticamente por clientName
  return Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b, "es"))
    .reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {});
};

/**
 * Calcular totales generales de todas las cotizaciones
 */
export const calculateGrandTotals = (quotations) => {
  return quotations.reduce(
    (acc, quotation) => {
      if (quotation.grandTotals) {
        acc.totalUSD += quotation.grandTotals.totalGeneral || 0;
        acc.totalBs += quotation.grandTotals.totalCostInBs || 0;
      }
      return acc;
    },
    { totalUSD: 0, totalBs: 0 }
  );
};

/**
 * Función debounce para optimizar búsquedas
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
