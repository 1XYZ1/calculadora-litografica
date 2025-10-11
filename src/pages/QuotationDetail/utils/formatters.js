// src/pages/QuotationDetail/utils/formatters.js

/**
 * Utilidades de formateo para QuotationDetail
 */

/**
 * Formatea un número como moneda USD
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string} Cantidad formateada como moneda
 *
 * @example
 * formatMoney(1234.56) // "$1,234.56"
 * formatMoney(1234.567, 'USD', 4) // "$1,234.5670"
 */
export function formatMoney(amount, currency = 'USD', decimals = 2) {
  const num = parseFloat(amount);
  if (isNaN(num) || !Number.isFinite(num)) return `$0.00`;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formatea dimensiones en cm a cm o metros según tamaño
 * @param {number} cm - Dimensión en centímetros
 * @returns {string} Dimensión formateada con unidad apropiada
 *
 * @example
 * formatDimension(50) // "50cm"
 * formatDimension(150) // "1.5m"
 * formatDimension(99.5) // "99.5cm"
 */
export function formatDimension(cm) {
  const val = parseFloat(cm);
  if (isNaN(val)) return '';

  if (val < 100) {
    return `${parseFloat(val.toFixed(2))}cm`;
  }
  return `${parseFloat((val / 100).toFixed(2))}m`;
}

/**
 * Formatea timestamp de Firestore a fecha legible
 * @param {Object} timestamp - Timestamp de Firestore con método toDate() o Date object
 * @returns {string} Fecha formateada en español
 *
 * @example
 * formatDate(firestoreTimestamp) // "11 de octubre de 2025"
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return new Intl.DateTimeFormat('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
