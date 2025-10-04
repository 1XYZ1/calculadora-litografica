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
