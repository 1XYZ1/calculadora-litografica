import {
  ADMIN_ERROR_MESSAGES,
  ADMIN_SUCCESS_MESSAGES,
} from "../../../utils/constants";

/**
 * Valida que un precio sea un número válido y mayor o igual a 0
 * @param {string} priceStr - String del precio a validar
 * @param {string} fieldName - Nombre del campo para el mensaje de error
 * @returns {Object} { isValid: boolean, error: string|null, value: number|null }
 */
export function validatePrice(priceStr, fieldName) {
  if (priceStr === "") {
    return {
      isValid: false,
      error: `Por favor, ingrese un precio válido para ${fieldName}.`,
      value: null,
    };
  }

  const price = parseFloat(priceStr);

  if (isNaN(price) || price < 0) {
    return {
      isValid: false,
      error: `Por favor, ingrese un precio válido para ${fieldName}.`,
      value: null,
    };
  }

  return { isValid: true, error: null, value: price };
}

/**
 * Valida que un porcentaje sea un número válido y mayor o igual a 0
 * @param {string} percentageStr - String del porcentaje a validar
 * @param {string} fieldName - Nombre del campo para el mensaje de error
 * @returns {Object} { isValid: boolean, error: string|null, value: number|null }
 */
export function validatePercentage(percentageStr, fieldName) {
  if (percentageStr === "") {
    return {
      isValid: false,
      error: `Por favor, ingrese un porcentaje válido para ${fieldName}.`,
      value: null,
    };
  }

  const percentage = parseFloat(percentageStr);

  if (isNaN(percentage) || percentage < 0) {
    return {
      isValid: false,
      error: `Por favor, ingrese un porcentaje válido para ${fieldName}.`,
      value: null,
    };
  }

  return { isValid: true, error: null, value: percentage };
}

/**
 * Valida que una tasa BCV sea un número válido y mayor a 0
 * @param {string} rateStr - String de la tasa a validar
 * @returns {Object} { isValid: boolean, error: string|null, value: number|null }
 */
export function validateBcvRate(rateStr) {
  if (rateStr === "") {
    return {
      isValid: false,
      error: ADMIN_ERROR_MESSAGES.INVALID_BCV_RATE,
      value: null,
    };
  }

  const rate = parseFloat(rateStr);

  if (isNaN(rate) || rate <= 0) {
    return {
      isValid: false,
      error: ADMIN_ERROR_MESSAGES.INVALID_BCV_RATE,
      value: null,
    };
  }

  return { isValid: true, error: null, value: rate };
}

/**
 * Genera un ID válido para Firestore a partir del nombre de un papel
 * Convierte a minúsculas, reemplaza espacios por guiones bajos y elimina caracteres especiales
 * @param {string} paperName - Nombre del papel
 * @returns {string} ID generado
 */
export function generatePaperId(paperName) {
  return paperName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/**
 * Formatea el nombre de un ID para mostrarlo en mensajes
 * Reemplaza guiones bajos por espacios
 * @param {string} id - ID a formatear
 * @returns {string} Nombre formateado
 */
export function formatIdForMessage(id) {
  return id.replace(/_/g, " ");
}

/**
 * Valida que un nombre de papel sea válido (no vacío)
 * @param {string} name - Nombre a validar
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validatePaperName(name) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      error: ADMIN_ERROR_MESSAGES.INVALID_NAME,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Valida los campos de un nuevo papel (nombre y precio)
 * @param {string} name - Nombre del papel
 * @param {string} priceStr - Precio del papel como string
 * @returns {Object} { isValid: boolean, error: string|null, price: number|null }
 */
export function validateNewPaper(name, priceStr) {
  // Validar que ambos campos tengan valor
  if (!name || priceStr === "") {
    return {
      isValid: false,
      error: ADMIN_ERROR_MESSAGES.PAPER_NAME_PRICE_REQUIRED,
      price: null,
    };
  }

  // Validar el precio
  const priceValidation = validatePrice(priceStr, "papel");
  if (!priceValidation.isValid) {
    return {
      isValid: false,
      error: priceValidation.error,
      price: null,
    };
  }

  return { isValid: true, error: null, price: priceValidation.value };
}
