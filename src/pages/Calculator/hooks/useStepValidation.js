import { useCallback } from "react";

/**
 * Hook para validar cada paso del stepper (4 pasos)
 * Retorna funciones para validar pasos y obtener errores
 */
export function useStepValidation() {
  /**
   * Valida un paso específico y retorna array de mensajes de error
   */
  const validateStep = useCallback((step, currentItem, items) => {
    const errors = [];

    switch (step) {
      case 1: // Información Básica + Configuración de Impresión
        // Validar información básica
        if (
          !currentItem.quotationName ||
          currentItem.quotationName.trim() === ""
        ) {
          errors.push("El nombre del item es obligatorio");
        }

        if (!currentItem.totalPieces || currentItem.totalPieces <= 0) {
          errors.push("La cantidad debe ser mayor a 0");
        }

        if (!currentItem.pieceWidthCm || currentItem.pieceWidthCm <= 0) {
          errors.push("El ancho debe ser mayor a 0");
        }

        if (!currentItem.pieceHeightCm || currentItem.pieceHeightCm <= 0) {
          errors.push("El alto debe ser mayor a 0");
        }

        // Validaciones específicas de talonarios
        if (currentItem.isTalonarios) {
          if (!currentItem.numTalonarios || currentItem.numTalonarios <= 0) {
            errors.push("El número de talonarios debe ser mayor a 0");
          }
          if (!currentItem.sheetsPerSet || currentItem.sheetsPerSet <= 0) {
            errors.push("El número de hojas por juego debe ser mayor a 0");
          }
          if (!currentItem.copiesPerSet || currentItem.copiesPerSet <= 0) {
            errors.push("El número de copias debe ser mayor a 0");
          }
        }

        // Validar configuración de impresión
        if (!currentItem.printingAreaOption) {
          errors.push("Debe seleccionar un área de impresión");
        }

        if (!currentItem.numColorsTiro || currentItem.numColorsTiro <= 0) {
          errors.push("Debe especificar al menos 1 color de tiro");
        }

        // Validar colores de retiro si es tiro/retiro y NO es work-and-turn
        if (currentItem.isTiroRetiro && !currentItem.isWorkAndTurn) {
          if (
            !currentItem.numColorsRetiro ||
            currentItem.numColorsRetiro <= 0
          ) {
            errors.push("Debe especificar colores de retiro");
          }
        }
        break;

      case 2: // Materiales/Equipos + Acabados
        // Solo validar materiales si NO es impresión digital
        if (currentItem.printingAreaOption !== "quarter_sheet_digital") {
          if (!currentItem.selectedPaperTypeId) {
            errors.push("Debe seleccionar un tipo de papel");
          }

          if (!currentItem.selectedPlateSizeId) {
            errors.push("Debe seleccionar un tamaño de plancha");
          }

          if (!currentItem.selectedMachineTypeId) {
            errors.push("Debe seleccionar un tipo de máquina");
          }
        }
        // Acabados son opcionales, no se validan
        break;

      case 3: // Resumen del Item (solo revisión)
        // Sin validaciones adicionales, solo revisión
        break;

      case 4: // Resumen de Cotización
        if (items.length === 0) {
          errors.push("Debe agregar al menos un item al presupuesto");
        }
        break;

      default:
        break;
    }

    return errors;
  }, []);

  /**
   * Obtiene errores para mostrar inline en un paso específico
   * Retorna un objeto con campos como llaves y mensajes como valores
   */
  const getStepErrors = useCallback((step, currentItem, items) => {
    const errorObj = {};

    switch (step) {
      case 1: // Información Básica + Configuración de Impresión
        // Validar información básica
        if (
          !currentItem.quotationName ||
          currentItem.quotationName.trim() === ""
        ) {
          errorObj.quotationName = "El nombre del item es obligatorio";
        }

        if (!currentItem.totalPieces || currentItem.totalPieces <= 0) {
          errorObj.totalPieces = "La cantidad debe ser mayor a 0";
        }

        if (!currentItem.pieceWidthCm || currentItem.pieceWidthCm <= 0) {
          errorObj.pieceWidthCm = "El ancho debe ser mayor a 0";
        }

        if (!currentItem.pieceHeightCm || currentItem.pieceHeightCm <= 0) {
          errorObj.pieceHeightCm = "El alto debe ser mayor a 0";
        }

        // Validaciones específicas de talonarios
        if (currentItem.isTalonarios) {
          if (!currentItem.numTalonarios || currentItem.numTalonarios <= 0) {
            errorObj.numTalonarios =
              "El número de talonarios debe ser mayor a 0";
          }
          if (!currentItem.sheetsPerSet || currentItem.sheetsPerSet <= 0) {
            errorObj.sheetsPerSet =
              "El número de hojas por juego debe ser mayor a 0";
          }
          if (!currentItem.copiesPerSet || currentItem.copiesPerSet <= 0) {
            errorObj.copiesPerSet = "El número de copias debe ser mayor a 0";
          }
        }

        // Validar configuración de impresión
        if (!currentItem.printingAreaOption) {
          errorObj.printingAreaOption = "Debe seleccionar un área de impresión";
        }

        if (!currentItem.numColorsTiro || currentItem.numColorsTiro <= 0) {
          errorObj.numColorsTiro = "Debe especificar al menos 1 color de tiro";
        }

        // Validar colores de retiro si es tiro/retiro y NO es work-and-turn
        if (currentItem.isTiroRetiro && !currentItem.isWorkAndTurn) {
          if (
            !currentItem.numColorsRetiro ||
            currentItem.numColorsRetiro <= 0
          ) {
            errorObj.numColorsRetiro = "Debe especificar colores de retiro";
          }
        }
        break;

      case 2: // Materiales/Equipos + Acabados
        // Solo validar materiales si NO es impresión digital
        if (currentItem.printingAreaOption !== "quarter_sheet_digital") {
          if (!currentItem.selectedPaperTypeId) {
            errorObj.selectedPaperTypeId = "Debe seleccionar un tipo de papel";
          }

          if (!currentItem.selectedPlateSizeId) {
            errorObj.selectedPlateSizeId =
              "Debe seleccionar un tamaño de plancha";
          }

          if (!currentItem.selectedMachineTypeId) {
            errorObj.selectedMachineTypeId =
              "Debe seleccionar un tipo de máquina";
          }
        }
        // Acabados son opcionales
        break;

      case 3: // Resumen del Item
        // Sin validaciones
        break;

      case 4: // Resumen de Cotización
        // Sin validaciones inline
        break;

      default:
        break;
    }

    return errorObj;
  }, []);

  return {
    validateStep,
    getStepErrors,
  };
}
