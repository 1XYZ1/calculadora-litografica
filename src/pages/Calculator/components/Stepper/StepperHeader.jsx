import React from "react";

/**
 * Header del stepper con navegación visual de 4 pasos
 * Diseño minimalista sin emojis ni progreso textual
 */
export default function StepperHeader({
  currentStep,
  completedSteps,
  canNavigateToStep,
  onStepClick,
}) {
  const steps = [
    { number: 1, title: "Configuración" },
    { number: 2, title: "Materiales" },
    { number: 3, title: "Resumen Item" },
    { number: 4, title: "Presupuesto" },
  ];

  // Determinar el estado de cada paso
  const getStepState = (stepNumber) => {
    if (completedSteps.includes(stepNumber)) return "completed";
    if (stepNumber === currentStep) return "current";
    if (canNavigateToStep(stepNumber)) return "available";
    return "locked";
  };

  // Estilos minimalistas según el estado del paso
  const getStepStyles = (state) => {
    const baseStyles =
      "relative flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-medium transition-all duration-300";

    switch (state) {
      case "completed":
        return `${baseStyles} bg-gray-700 text-white shadow-sm`;
      case "current":
        return `${baseStyles} bg-blue-500 text-white border-2 border-blue-600`;
      case "available":
        return `${baseStyles} bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer`;
      case "locked":
      default:
        return `${baseStyles} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
  };

  const handleStepClick = (stepNumber) => {
    const state = getStepState(stepNumber);
    if (state === "available" || state === "completed" || state === "current") {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full p-2 sm:p-4 mb-4 sm:mb-6">
      {/* Línea conectora horizontal continua */}
      <div className="relative">
        <div className="absolute top-3 sm:top-4 left-0 w-full h-px bg-gray-200" />

        {/* Steps */}
        <div className="relative flex justify-between px-2 sm:px-0">
          {steps.map((step) => {
            const state = getStepState(step.number);
            const isClickable =
              state === "available" ||
              state === "completed" ||
              state === "current";

            return (
              <div key={step.number} className="flex flex-col items-center">
                {/* Círculo del paso */}
                <button
                  onClick={() => handleStepClick(step.number)}
                  disabled={!isClickable}
                  className={getStepStyles(state)}
                  aria-label={`Paso ${step.number}: ${step.title}`}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {state === "completed" ? (
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs sm:text-sm">{step.number}</span>
                  )}
                </button>

                {/* Título del paso */}
                <div className="mt-1 sm:mt-2 text-center max-w-[60px] sm:max-w-none">
                  <p
                    className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 ${
                      state === "current"
                        ? "text-blue-600"
                        : state === "completed"
                        ? "text-gray-700"
                        : state === "locked"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {/* Título corto en móviles, completo en desktop */}
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">
                      {step.number === 1 && "Config"}
                      {step.number === 2 && "Materiales"}
                      {step.number === 3 && "Resumen"}
                      {step.number === 4 && "Final"}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
