import { calculateBestFit } from "./calculations";
import {
  PRINTING_AREAS,
  FINISHING_KEYS,
  TROQUELADO_SEPARATION,
} from "./constants";

/**
 * Obtener dimensiones y configuración de hoja según área de impresión
 */
export const getSheetDimensions = (printingAreaOption) => {
  const areaConfig = Object.values(PRINTING_AREAS).find(
    (area) => area.value === printingAreaOption
  );

  if (!areaConfig) {
    return { width: 0, height: 0, divisor: 0, isDigital: false };
  }

  return {
    width: areaConfig.width,
    height: areaConfig.height,
    divisor: areaConfig.divisor,
    isDigital: areaConfig.isDigital || false,
  };
};

/**
 * Calcular costo de impresión digital
 */
export const calculateDigitalCost = ({
  pieces,
  fit,
  isDigitalDuplex,
  finishingPrices,
}) => {
  const pagesToPrint = fit.count > 0 ? Math.ceil(pieces / fit.count) : pieces;
  const priceKey = isDigitalDuplex
    ? FINISHING_KEYS.DIGITAL_TIRO_RETIRO
    : FINISHING_KEYS.DIGITAL_TIRO;

  const millarCost = pagesToPrint * (finishingPrices[priceKey] || 0);

  return {
    baseCost: millarCost,
    millarCost,
    pagesToPrint,
    paperCost: 0,
    plateCost: 0,
    requiredFullSheets: 0,
    totalSheetsWithSobrante: 0,
    numPlates: 0,
    totalRuns: 0,
  };
};

/**
 * Calcular costo de planchas
 */
export const calculatePlateCost = ({
  numColorsTiro,
  numColorsRetiro,
  isTiroRetiro,
  isWorkAndTurn,
  selectedPlateSizeId,
  plateSizes,
}) => {
  let numPlates = 0;

  if (isWorkAndTurn) {
    numPlates = parseInt(numColorsTiro, 10) || 0;
  } else {
    numPlates =
      (parseInt(numColorsTiro, 10) || 0) +
      (isTiroRetiro ? parseInt(numColorsRetiro, 10) || 0 : 0);
  }

  const platePrice =
    plateSizes.find((p) => p.id === selectedPlateSizeId)?.price || 0;

  return {
    numPlates,
    plateCost: numPlates * platePrice,
  };
};

/**
 * Calcular costo de papel
 */
export const calculatePaperCost = ({
  requiredFullSheets,
  sobrantePliegos,
  selectedPaperTypeId,
  paperTypes,
}) => {
  const sobrante = parseInt(sobrantePliegos, 10) || 0;
  const totalSheetsWithSobrante = requiredFullSheets + sobrante;

  const pricePerSheet =
    paperTypes.find((p) => p.id === selectedPaperTypeId)?.pricePerSheet || 0;

  return {
    paperCost: totalSheetsWithSobrante * pricePerSheet,
    totalSheetsWithSobrante,
  };
};

/**
 * Calcular costo de millar (impresión)
 */
export const calculateMillarCost = ({
  pagesToPrint,
  numColorsTiro,
  numColorsRetiro,
  isTiroRetiro,
  isWorkAndTurn,
  selectedMachineTypeId,
  machineTypes,
}) => {
  const colorsTiroNum = parseInt(numColorsTiro, 10) || 0;
  const colorsRetiroNum = parseInt(numColorsRetiro, 10) || 0;
  const roundedPagesToPrint = Math.ceil(pagesToPrint / 1000) * 1000;

  let totalRuns = 0;
  if (isTiroRetiro) {
    if (isWorkAndTurn) {
      totalRuns = roundedPagesToPrint * colorsTiroNum * 2;
    } else {
      totalRuns =
        roundedPagesToPrint * colorsTiroNum +
        roundedPagesToPrint * colorsRetiroNum;
    }
  } else {
    totalRuns = roundedPagesToPrint * colorsTiroNum;
  }

  const millarPrice =
    machineTypes.find((m) => m.id === selectedMachineTypeId)?.millarPrice || 0;

  const millarCost = (totalRuns / 1000) * millarPrice;

  return {
    millarCost,
    totalRuns,
  };
};

/**
 * Calcular costo de impresión offset
 */
export const calculateOffsetCost = ({
  pieces,
  fit,
  sheetDivisor,
  numColorsTiro,
  numColorsRetiro,
  isTiroRetiro,
  isWorkAndTurn,
  sobrantePliegos,
  selectedPaperTypeId,
  selectedPlateSizeId,
  selectedMachineTypeId,
  paperTypes,
  plateSizes,
  machineTypes,
}) => {
  const pagesToPrint = fit.count > 0 ? Math.ceil(pieces / fit.count) : pieces;
  const requiredFullSheets =
    sheetDivisor > 0 ? Math.ceil(pagesToPrint / sheetDivisor) : 0;

  // Calcular planchas
  const { numPlates, plateCost } = calculatePlateCost({
    numColorsTiro,
    numColorsRetiro,
    isTiroRetiro,
    isWorkAndTurn,
    selectedPlateSizeId,
    plateSizes,
  });

  // Calcular papel
  const { paperCost, totalSheetsWithSobrante } = calculatePaperCost({
    requiredFullSheets,
    sobrantePliegos,
    selectedPaperTypeId,
    paperTypes,
  });

  // Calcular millar
  const { millarCost, totalRuns } = calculateMillarCost({
    pagesToPrint,
    numColorsTiro,
    numColorsRetiro,
    isTiroRetiro,
    isWorkAndTurn,
    selectedMachineTypeId,
    machineTypes,
  });

  const baseCost = paperCost + millarCost + plateCost;

  return {
    baseCost,
    paperCost,
    plateCost,
    millarCost,
    pagesToPrint,
    requiredFullSheets,
    totalSheetsWithSobrante,
    numPlates,
    totalRuns,
  };
};

/**
 * Calcular costos de acabados
 */
export const calculateFinishingCosts = ({
  pagesToPrint,
  requiredFullSheets,
  isUVSelected,
  uvSizeOption,
  isRemateSelected,
  isLaminadoMateSelected,
  isLaminadoMateTiroRetiro,
  isLaminadoBrillanteSelected,
  isLaminadoBrillanteTiroRetiro,
  isSignadoSelected,
  isTroqueladoSelected,
  troquelPrice,
  isDigital,
  finishingPrices,
}) => {
  let finishingCost = 0;

  // UV
  if (isUVSelected && uvSizeOption) {
    const uvPriceKey = `${FINISHING_KEYS.UV_PREFIX}${uvSizeOption}`;
    const uvPrice = finishingPrices[uvPriceKey] || 0;
    finishingCost += pagesToPrint * uvPrice;
  }

  // Laminado Mate
  if (isLaminadoMateSelected) {
    finishingCost +=
      pagesToPrint *
      (finishingPrices[FINISHING_KEYS.LAMINADO_MATE] || 0) *
      (isLaminadoMateTiroRetiro ? 2 : 1);
  }

  // Laminado Brillante
  if (isLaminadoBrillanteSelected) {
    finishingCost +=
      pagesToPrint *
      (finishingPrices[FINISHING_KEYS.LAMINADO_BRILLANTE] || 0) *
      (isLaminadoBrillanteTiroRetiro ? 2 : 1);
  }

  // Acabados solo para offset (no digital)
  if (!isDigital) {
    const millarFullSheets = Math.ceil(requiredFullSheets / 1000);

    if (isRemateSelected) {
      finishingCost +=
        millarFullSheets * (finishingPrices[FINISHING_KEYS.REMATE] || 0);
    }

    if (isSignadoSelected) {
      finishingCost +=
        millarFullSheets * (finishingPrices[FINISHING_KEYS.SIGNADO] || 0);
    }

    if (isTroqueladoSelected) {
      finishingCost +=
        millarFullSheets * (finishingPrices[FINISHING_KEYS.TROQUELADO] || 0);
    }
  }

  // Costo manual del troquel (fijo)
  const manualTroquelPrice = parseFloat(troquelPrice) || 0;
  finishingCost += manualTroquelPrice;

  return finishingCost;
};

/**
 * Calcular aprovechamiento de piezas adicionales en desperdicio
 */
export const calculateAdditionalPiecesYield = ({
  layoutInfo,
  additionalPieces,
  separation,
  sheetW,
  sheetH,
}) => {
  if (!layoutInfo || !additionalPieces || additionalPieces.length === 0) {
    return { updatedLayoutInfo: layoutInfo, additionalYields: {} };
  }

  const updatedLayoutInfo = { ...layoutInfo, additionalYields: {} };
  updatedLayoutInfo.placedPieces = [...layoutInfo.placedPieces];

  // Rectángulos de desperdicio disponibles
  let availableWasteRects = [
    {
      id: "waste1",
      x: layoutInfo.occupiedW,
      y: 0,
      w: sheetW - layoutInfo.occupiedW,
      h: sheetH,
    },
    {
      id: "waste2",
      x: 0,
      y: layoutInfo.occupiedH,
      w: layoutInfo.occupiedW,
      h: sheetH - layoutInfo.occupiedH,
    },
  ].filter((r) => r.w > separation && r.h > separation);

  // Ordenar piezas adicionales por área (más grandes primero)
  const sortedAdditionalPieces = [...additionalPieces]
    .filter((p) => p.width && p.height)
    .sort((a, b) => b.width * b.height - a.width * a.height);

  for (const addPiece of sortedAdditionalPieces) {
    if (availableWasteRects.length === 0) break;

    let bestFit = null;
    let bestRectIndex = -1;

    // Buscar mejor encaje en los rectángulos disponibles
    for (let i = 0; i < availableWasteRects.length; i++) {
      const rect = availableWasteRects[i];
      const currentFit = calculateBestFit(
        parseFloat(addPiece.width),
        parseFloat(addPiece.height),
        rect.w,
        rect.h,
        separation
      );

      if (
        currentFit.count > 0 &&
        (!bestFit || currentFit.count > bestFit.count)
      ) {
        bestFit = currentFit;
        bestRectIndex = i;
      }
    }

    if (bestFit) {
      const rectToUse = availableWasteRects[bestRectIndex];

      // Guardar rendimiento
      updatedLayoutInfo.additionalYields[addPiece.id] = {
        countPerSheet: bestFit.count,
        name: `Pieza ${addPiece.width}x${addPiece.height}cm`,
      };

      // Calcular dimensiones finales con rotación
      const addPieceW = bestFit.rotated
        ? parseFloat(addPiece.height)
        : parseFloat(addPiece.width);
      const addPieceH = bestFit.rotated
        ? parseFloat(addPiece.width)
        : parseFloat(addPiece.height);

      const effAddW = addPieceW + separation;
      const effAddH = addPieceH + separation;

      // Agregar piezas al layout
      for (let i = 0; i < bestFit.rows; i++) {
        for (let j = 0; j < bestFit.cols; j++) {
          updatedLayoutInfo.placedPieces.push({
            id: `add-${addPiece.id}-${i}-${j}`,
            x: rectToUse.x + j * effAddW,
            y: rectToUse.y + i * effAddH,
            w: addPieceW,
            h: addPieceH,
            type: "additional",
          });
        }
      }

      // Remover rectángulo usado
      availableWasteRects.splice(bestRectIndex, 1);
    }
  }

  return updatedLayoutInfo;
};

/**
 * Calcular total con margen de ganancia
 */
export const calculateTotalWithProfit = (
  baseCost,
  finishingCost,
  profitPercentage
) => {
  const totalCost = baseCost + finishingCost;
  const costWithProfit = totalCost * (1 + profitPercentage);
  return costWithProfit;
};

/**
 * Generar descripción de colores para el item
 */
export const generateColorsDescription = ({
  numColorsTiro,
  numColorsRetiro,
  isTiroRetiro,
  isWorkAndTurn,
}) => {
  const cTiro = parseInt(numColorsTiro, 10) || 0;
  const cRetiro = parseInt(numColorsRetiro, 10) || 0;

  let desc =
    cTiro > 0 ? `${cTiro === 4 ? "Full Color" : `${cTiro} colores`}` : "";

  if (isTiroRetiro) {
    if (isWorkAndTurn) {
      desc += ` / Retiro: ${
        cTiro === 4 ? "Full Color" : `${cTiro} colores`
      } (W&T)`;
    } else if (cRetiro > 0) {
      desc += ` / Retiro: ${
        cRetiro === 4 ? "Full Color" : `${cRetiro} colores`
      }`;
    }
  }

  return desc || "N/A";
};
