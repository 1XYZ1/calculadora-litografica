// Sheet dimensions in cm
export const HALF_SHEET_WIDTH = 66;
export const HALF_SHEET_HEIGHT = 48;
export const QUARTER_SHEET_WIDTH = 46;
export const QUARTER_SHEET_HEIGHT = 31;
export const DIGITAL_QUARTER_SHEET_WIDTH = 46;
export const DIGITAL_QUARTER_SHEET_HEIGHT = 32;
export const TABLOIDE_WIDTH = 43;
export const TABLOIDE_HEIGHT = 27.9;
export const OFICIO_WIDTH = 32;
export const OFICIO_HEIGHT = 22;
export const CARTA_WIDTH = 27.94;
export const CARTA_HEIGHT = 21.59;

// Troquel dimensions
export const TROQUEL_SHEET_WIDTH = 29;
export const TROQUEL_SHEET_HEIGHT = 24.5;
export const TROQUEL_SEPARATION = 0.7; // 7mm

// Printing area options configuration
export const PRINTING_AREAS = {
  HALF_SHEET: {
    value: "half_sheet",
    label: "Medio Pliego (66x48 cm)",
    width: HALF_SHEET_WIDTH,
    height: HALF_SHEET_HEIGHT,
    divisor: 2,
    plateSizeMatch: "1/2 pliego",
    machineMatch: "KORD",
  },
  QUARTER_SHEET: {
    value: "quarter_sheet",
    label: "Cuarto Pliego (46x31 cm)",
    width: QUARTER_SHEET_WIDTH,
    height: QUARTER_SHEET_HEIGHT,
    divisor: 4,
    plateSizeMatch: "1/4 pliego",
    machineMatch: "GTO",
  },
  TABLOIDE: {
    value: "tabloide",
    label: "Tabloide (43x27.9 cm)",
    width: TABLOIDE_WIDTH,
    height: TABLOIDE_HEIGHT,
    divisor: 4,
    plateSizeMatch: "tabloide",
    machineMatch: "ABDICK",
  },
  OFICIO: {
    value: "oficio",
    label: "Oficio (32x22 cm)",
    width: OFICIO_WIDTH,
    height: OFICIO_HEIGHT,
    divisor: 9,
    plateSizeMatch: "tabloide",
    machineMatch: "ABDICK",
  },
  CARTA: {
    value: "carta",
    label: "Carta (27.9x21.6 cm)",
    width: CARTA_WIDTH,
    height: CARTA_HEIGHT,
    divisor: 9,
    plateSizeMatch: "tabloide",
    machineMatch: "ABDICK",
  },
  DIGITAL_QUARTER: {
    value: "quarter_sheet_digital",
    label: "Digital (46x32 cm)",
    width: DIGITAL_QUARTER_SHEET_WIDTH,
    height: DIGITAL_QUARTER_SHEET_HEIGHT,
    divisor: 1,
    isDigital: true,
  },
};

// Finishing price keys
export const FINISHING_KEYS = {
  DIGITAL_TIRO: "digital_quarter_tiro",
  DIGITAL_TIRO_RETIRO: "digital_quarter_tiro_retiro",
  UV_PREFIX: "uv_",
  LAMINADO_MATE: "laminado_mate",
  LAMINADO_BRILLANTE: "laminado_brillante",
  REMATE: "remate",
  SIGNADO: "signado",
  TROQUELADO: "troquelado",
};

// Quotation status constants
export const QUOTATION_STATUS = {
  PENDING: "pending", // "pendiente de envío"
  SENT: "sent", // "Enviada"
  ACCEPTED: "accepted", // "Aceptada"
};

export const QUOTATION_STATUS_LABELS = {
  pending: "Pendiente de envío",
  sent: "Enviada",
  accepted: "Aceptada",
};

export const QUOTATION_STATUS_COLORS = {
  pending: "warning", // amarillo/amber
  sent: "info", // azul
  accepted: "success", // verde
};

// Messages
export const MESSAGES = {
  ERROR_NO_AUTH: "Debe estar autenticado.",
  ERROR_NO_ITEMS: "Añada al menos un item para guardar la cotización.",
  ERROR_INCOMPLETE_ITEM:
    "Por favor, complete los detalles del item antes de añadirlo.",
  ERROR_NO_ITEMS_PREVIEW: "Añada al menos un item para ver la vista previa.",
  ERROR_NOT_EDITING: "No se está editando ninguna cotización.",
  SUCCESS_SAVED: (name) => `Cotización "${name}" guardada.`,
  SUCCESS_UPDATED: (name) => `Cotización "${name}" actualizada.`,
  SUCCESS_ITEM_UPDATED: "Item actualizado correctamente.",
};

// Separation for troquelado (die-cut)
export const TROQUELADO_SEPARATION = 0.7;

// Initial states
export const initialItemState = {
  id: "",
  quotationName: "Item",
  totalPieces: "",
  pieceWidthCm: "",
  pieceHeightCm: "",
  additionalPieces: [],
  isTiroRetiro: false,
  numColorsTiro: "",
  numColorsRetiro: "",
  printingAreaOption: "",
  selectedPaperTypeId: "",
  sobrantePliegos: "",
  selectedPlateSizeId: "",
  selectedMachineTypeId: "",
  isDigitalDuplex: false,
  isUVSelected: false,
  uvSizeOption: "",
  isRemateSelected: false,
  isLaminadoMateSelected: false,
  isLaminadoMateTiroRetiro: false,
  isLaminadoBrillanteSelected: false,
  isLaminadoBrillanteTiroRetiro: false,
  isSignadoSelected: false,
  isTroqueladoSelected: false,
  isTalonarios: false,
  numTalonarios: "",
  sheetsPerSet: "",
  copiesPerSet: "",
  isWorkAndTurn: false,
  troquelPrice: "",
};

export const initialQuotationState = {
  mainQuotationName: "",
  clientName: "",
  items: [],
  grandTotals: { subtotal: 0, totalGeneral: 0, totalCostInBs: 0 },
};

// ============================================
// PRICE ADMIN CONSTANTS
// ============================================

// Opciones predefinidas para administrador de precios
export const PLATE_SIZE_OPTIONS = [
  { value: "1/4 pliego", label: "1/4 Pliego" },
  { value: "1/2 pliego", label: "1/2 Pliego" },
  { value: "Tabloide", label: "Tabloide" },
  { value: "Pliego Completo", label: "Pliego Completo" },
];

export const MACHINE_TYPE_OPTIONS = [
  { value: "GTO", label: "GTO" },
  { value: "KORD", label: "KORD" },
  { value: "ABDICK", label: "ABDICK" },
];

export const UV_SIZE_KEYS = [
  { key: "half_sheet", label: "Medio Pliego" },
  { key: "quarter_sheet", label: "Cuarto Pliego" },
  { key: "tabloide", label: "Tabloide" },
  { key: "oficio", label: "Oficio" },
  { key: "carta", label: "Carta" },
  { key: "quarter_sheet_digital", label: "Digital" },
];

// Mensajes de error para administrador de precios
export const ADMIN_ERROR_MESSAGES = {
  AUTH_REQUIRED: "Debe estar autenticado.",
  AUTH_REQUIRED_ACTION: "Debe estar autenticado para realizar esta acción.",
  INVALID_PRICE: "Por favor, ingrese un precio válido.",
  INVALID_PERCENTAGE: "Por favor, ingrese un porcentaje válido.",
  INVALID_NAME: "El nombre ingresado no es válido.",
  INVALID_BCV_RATE:
    "Por favor, ingrese una tasa de dólar BCV válida (mayor a 0).",
  PAPER_EXISTS:
    "Ya existe un papel con un nombre similar. Por favor, elija otro.",
  PAPER_NAME_PRICE_REQUIRED:
    "Por favor, ingrese nombre y precio para el nuevo papel.",
  PLATE_FIELDS_REQUIRED:
    "Por favor, complete todos los campos para el tamaño de plancha.",
  MACHINE_FIELDS_REQUIRED:
    "Por favor, complete todos los campos para el tipo de máquina.",
};

// Mensajes de éxito para administrador de precios
export const ADMIN_SUCCESS_MESSAGES = {
  PAPER_ADDED: "Nuevo tipo de papel añadido correctamente.",
  PAPER_DELETED: "Tipo de papel eliminado correctamente.",
  PAPER_UPDATED: (name) => `Precio para ${name} actualizado correctamente.`,
  PLATE_ADDED: "Tamaño de plancha añadido correctamente.",
  PLATE_DELETED: "Tamaño de plancha eliminado correctamente.",
  MACHINE_ADDED: "Tipo de máquina añadido correctamente.",
  MACHINE_DELETED: "Tipo de máquina eliminado correctamente.",
  FINISHING_UPDATED: (name) => `Precio de ${name} actualizado correctamente.`,
  PROFIT_UPDATED: "Porcentaje de ganancia actualizado correctamente.",
  BCV_UPDATED: "Tasa de dólar BCV actualizada correctamente.",
  IVA_UPDATED: "Porcentaje de IVA actualizado correctamente.",
};

// Configuraciones de colores por sección
export const SECTION_COLORS = {
  papers: {
    bg: "bg-blue-50",
    title: "text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  plates: {
    bg: "bg-green-50",
    title: "text-green-700",
    button: "bg-green-600 hover:bg-green-700",
  },
  machines: {
    bg: "bg-purple-50",
    title: "text-purple-700",
    button: "bg-purple-600 hover:bg-purple-700",
  },
  digital: {
    bg: "bg-cyan-50",
    title: "text-cyan-700",
    button: "bg-cyan-600 hover:bg-cyan-700",
  },
  finishing: {
    bg: "bg-yellow-50",
    title: "text-yellow-700",
    button: "bg-yellow-600 hover:bg-yellow-700",
  },
  profit: {
    bg: "bg-orange-50",
    title: "text-orange-700",
    button: "bg-orange-600 hover:bg-orange-700",
  },
  bcv: {
    bg: "bg-teal-50",
    title: "text-teal-700",
    button: "bg-teal-600 hover:bg-teal-700",
  },
  iva: {
    bg: "bg-pink-50",
    title: "text-pink-700",
    button: "bg-pink-600 hover:bg-pink-700",
  },
};
