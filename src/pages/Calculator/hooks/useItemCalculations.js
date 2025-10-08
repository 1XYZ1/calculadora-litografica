import { useMemo } from "react";
import {
  calculateBestFit,
  calculateTroquelFit,
} from "../../../utils/calculations";
import {
  getSheetDimensions,
  calculateDigitalCost,
  calculateOffsetCost,
  calculateFinishingCosts,
  calculateAdditionalPiecesYield,
  calculateTotalWithProfit,
} from "../../../utils/calculationEngine";
import {
  TROQUEL_SHEET_WIDTH,
  TROQUEL_SHEET_HEIGHT,
  TROQUEL_SEPARATION,
  TROQUELADO_SEPARATION,
} from "../../../utils/constants";

/**
 * Hook para calcular todos los costos y layouts del item actual
 * Reemplaza el useEffect gigante de 380 líneas
 */
export const useItemCalculations = ({
  currentItem,
  paperTypes,
  plateSizes,
  machineTypes,
  finishingPrices,
  profitPercentage,
}) => {
  // Calcular resultados del item usando useMemo para optimizar
  const itemResult = useMemo(() => {
    const {
      totalPieces,
      pieceWidthCm,
      pieceHeightCm,
      printingAreaOption,
      isDigitalDuplex,
      isUVSelected,
      uvSizeOption,
      isRemateSelected,
      isLaminadoMateSelected,
      isLaminadoMateTiroRetiro,
      isLaminadoBrillanteSelected,
      isLaminadoBrillanteTiroRetiro,
      isSignadoSelected,
      isTroqueladoSelected,
      selectedPaperTypeId,
      sobrantePliegos,
      numColorsTiro,
      isTiroRetiro,
      numColorsRetiro,
      selectedMachineTypeId,
      selectedPlateSizeId,
      isWorkAndTurn,
      troquelPrice,
      additionalPieces,
    } = currentItem;

    const pieces = parseFloat(totalPieces) || 0;
    const pWidth = parseFloat(pieceWidthCm);
    const pHeight = parseFloat(pieceHeightCm);
    const hasCustomDimensions = pWidth > 0 && pHeight > 0;

    // Validar datos mínimos
    if (
      !pieces ||
      !printingAreaOption ||
      (hasCustomDimensions && (!pWidth || !pHeight))
    ) {
      return {
        totalGeneral: 0,
        layoutInfo: null,
        troquelLayoutInfo: null,
      };
    }

    const sheetConfig = getSheetDimensions(printingAreaOption);
    let layoutInfo = null;
    let troquelLayoutInfo = null;
    let costResult = {};

    // Cálculo para impresión digital
    if (sheetConfig.isDigital) {
      const fit = hasCustomDimensions
        ? calculateBestFit(
            pWidth,
            pHeight,
            sheetConfig.width,
            sheetConfig.height
          )
        : { count: 1 };

      if (hasCustomDimensions && fit.count > 0) {
        layoutInfo = {
          ...fit,
          sheetW: sheetConfig.width,
          sheetH: sheetConfig.height,
          pieceW: pWidth,
          pieceH: pHeight,
        };
      }

      costResult = calculateDigitalCost({
        pieces,
        fit,
        isDigitalDuplex,
        finishingPrices,
      });
    }
    // Cálculo para impresión offset
    else {
      const separation = isTroqueladoSelected ? TROQUELADO_SEPARATION : 0;
      const fit = hasCustomDimensions
        ? calculateBestFit(
            pWidth,
            pHeight,
            sheetConfig.width,
            sheetConfig.height,
            separation
          )
        : { count: 1 };

      if (hasCustomDimensions) {
        if (fit.count > 0) {
          layoutInfo = {
            ...fit,
            sheetW: sheetConfig.width,
            sheetH: sheetConfig.height,
            pieceW: pWidth,
            pieceH: pHeight,
            separation,
            placedPieces: [],
          };

          // Calcular posiciones de las piezas principales
          const finalPieceW = fit.rotated ? pHeight : pWidth;
          const finalPieceH = fit.rotated ? pWidth : pHeight;
          const effPieceW = finalPieceW + separation;
          const effPieceH = finalPieceH + separation;

          for (let i = 0; i < fit.rows; i++) {
            for (let j = 0; j < fit.cols; j++) {
              layoutInfo.placedPieces.push({
                id: `main-${i}-${j}`,
                x: j * effPieceW,
                y: i * effPieceH,
                w: finalPieceW,
                h: finalPieceH,
                type: "main",
              });
            }
          }
        } else {
          return {
            totalGeneral: 0,
            layoutInfo: null,
            troquelLayoutInfo: null,
          };
        }
      }

      costResult = calculateOffsetCost({
        pieces,
        fit,
        sheetDivisor: sheetConfig.divisor,
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
      });

      // Calcular aprovechamiento de piezas adicionales
      if (layoutInfo && additionalPieces && additionalPieces.length > 0) {
        layoutInfo = calculateAdditionalPiecesYield({
          layoutInfo,
          additionalPieces,
          separation,
          sheetW: sheetConfig.width,
          sheetH: sheetConfig.height,
        });
      }
    }

    // Calcular costos de acabados
    const finishingCost = calculateFinishingCosts({
      pagesToPrint: costResult.pagesToPrint,
      requiredFullSheets: costResult.requiredFullSheets || 0,
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
      isDigital: sheetConfig.isDigital,
      finishingPrices,
    });

    // Calcular total con ganancia
    const totalGeneral = calculateTotalWithProfit(
      costResult.baseCost,
      finishingCost,
      profitPercentage
    );

    // Calcular layout de troquelado si aplica
    if (isTroqueladoSelected && pWidth > 0 && pHeight > 0) {
      const troquelFit = calculateTroquelFit(
        pWidth,
        pHeight,
        TROQUEL_SHEET_WIDTH,
        TROQUEL_SHEET_HEIGHT,
        TROQUEL_SEPARATION
      );

      if (troquelFit.count > 0) {
        troquelLayoutInfo = {
          ...troquelFit,
          sheetW: TROQUEL_SHEET_WIDTH,
          sheetH: TROQUEL_SHEET_HEIGHT,
          pieceW: pWidth,
          pieceH: pHeight,
          separation: TROQUEL_SEPARATION,
        };
      }
    }

    return {
      totalGeneral,
      costWithProfit: totalGeneral,
      finishingCost,
      layoutInfo,
      troquelLayoutInfo,
      ...costResult,
    };
  }, [
    currentItem,
    paperTypes,
    plateSizes,
    machineTypes,
    finishingPrices,
    profitPercentage,
  ]);

  return itemResult;
};
