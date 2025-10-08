import { useState, useCallback } from "react";

/**
 * Hook para gestionar la navegación del stepper de 4 pasos
 * Controla el paso actual, pasos completados y validación antes de avanzar
 */
export function useStepperNavigation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Función para scroll al inicio completo de la página
  const scrollToTop = useCallback(() => {
    // Método 1: Scroll del window principal
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    // Método 2: Scroll del document element (para casos donde window no funciona)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }

    // Método 3: Scroll del body (fallback adicional)
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Método 4: Scroll inmediato sin animación como fallback
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  // Navegar a un paso específico
  const goToStep = useCallback(
    (stepNumber) => {
      if (stepNumber >= 1 && stepNumber <= 4) {
        setCurrentStep(stepNumber);
        // Scroll automático al inicio completo de la página
        scrollToTop();
      }
    },
    [scrollToTop]
  );

  // Avanzar al siguiente paso
  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      // Scroll automático al inicio completo de la página
      scrollToTop();
    }
  }, [currentStep, scrollToTop]);

  // Retroceder al paso anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      // Scroll automático al inicio completo de la página
      scrollToTop();
    }
  }, [currentStep, scrollToTop]);

  // Marcar un paso como completado
  const markStepComplete = useCallback((step) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }, []);

  // Desmarcar un paso completado (útil si se modifica)
  const unmarkStepComplete = useCallback((step) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.delete(step);
      return newSet;
    });
  }, []);

  // Verificar si un paso está completado
  const isStepComplete = useCallback(
    (step) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  // Verificar si se puede navegar a un paso (está completado o es el siguiente)
  const canNavigateToStep = useCallback(
    (step) => {
      // Siempre se puede ir al paso 1
      if (step === 1) return true;

      // Se puede ir a un paso si el anterior está completado
      return completedSteps.has(step - 1);
    },
    [completedSteps]
  );

  // Reiniciar el stepper
  const resetStepper = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
  }, []);

  return {
    currentStep,
    completedSteps: Array.from(completedSteps),
    goToStep,
    nextStep,
    previousStep,
    markStepComplete,
    unmarkStepComplete,
    isStepComplete,
    canNavigateToStep,
    resetStepper,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === 4,
  };
}
