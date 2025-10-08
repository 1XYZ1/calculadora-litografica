import React from "react";

/**
 * Botones de navegación del stepper
 * Maneja la navegación entre pasos con validación
 */
export default function StepNavigationButtons({
  currentStep,
  isFirstStep,
  isLastStep,
  isValid,
  onPrevious,
  onNext,
  onComplete,
  validationErrors = {},
  isLoading = false,
  customNextLabel = null,
  customCompleteLabel = null,
}) {
  // Etiquetas personalizadas según el paso
  const getNextButtonLabel = () => {
    if (customNextLabel) return customNextLabel;

    switch (currentStep) {
      case 5:
        return "Agregar al Presupuesto";
      case 6:
        return "Finalizar";
      default:
        return "Siguiente";
    }
  };

  const getCompleteButtonLabel = () => {
    if (customCompleteLabel) return customCompleteLabel;
    return "Guardar Cotización";
  };

  // Mostrar mensaje de error si hay errores de validación
  const renderValidationMessage = () => {
    const errorCount = Object.keys(validationErrors).length;

    if (errorCount === 0) return null;

    return (
      <div className="flex items-center justify-center mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <svg
          className="w-5 h-5 text-red-500 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-red-700">
          {errorCount === 1
            ? "Hay 1 campo que requiere tu atención"
            : `Hay ${errorCount} campos que requieren tu atención`}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white border-t border-gray-200 p-3 sm:p-4 sticky bottom-0 z-10 shadow-lg">
      {renderValidationMessage()}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 max-w-6xl mx-auto">
        {/* Botón Anterior */}
        <button
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
          className={`
            flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 min-h-[44px] text-sm sm:text-base
            ${
              isFirstStep || isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md active:scale-95"
            }
          `}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Anterior
        </button>

        {/* Indicador de paso actual - visible en tablets y desktop */}
        <div className="hidden md:block text-center">
          <p className="text-sm text-gray-500">
            Paso <span className="font-bold text-blue-600">{currentStep}</span>{" "}
            de 4
          </p>
        </div>

        {/* Botón Siguiente / Completar */}
        {isLastStep ? (
          <button
            onClick={onComplete}
            disabled={!isValid || isLoading}
            className={`
              flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 min-h-[44px] text-sm sm:text-base
              ${
                !isValid || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg active:scale-95"
              }
            `}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <span className="hidden sm:inline">
                  {getCompleteButtonLabel()}
                </span>
                <span className="sm:hidden">Guardar</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!isValid || isLoading}
            className={`
              flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 min-h-[44px] text-sm sm:text-base
              ${
                !isValid || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95"
              }
            `}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{getNextButtonLabel()}</span>
                <span className="sm:hidden">Siguiente</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
