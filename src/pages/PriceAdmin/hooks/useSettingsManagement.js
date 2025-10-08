import { useState, useEffect, useCallback } from "react";
import { doc, setDoc } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import { validatePercentage, validateBcvRate } from "../utils/priceValidation";
import {
  ADMIN_ERROR_MESSAGES,
  ADMIN_SUCCESS_MESSAGES,
} from "../../../utils/constants";

/**
 * Hook para gestionar configuraciones generales:
 * - Porcentaje de ganancia
 * - Tasa de dólar BCV
 * - Porcentaje de IVA
 */
export function useSettingsManagement(settings, notification) {
  const { db, appId, userId } = useFirebase();

  // Estados de inputs
  const [profitPercentageInput, setProfitPercentageInput] = useState("");
  const [bcvRateInput, setBcvRateInput] = useState("");
  const [ivaPercentageInput, setIvaPercentageInput] = useState("");

  // Sincronizar inputs con valores de Firestore
  useEffect(() => {
    if (!settings) return;

    // Convertir porcentaje de ganancia a % (de decimal a porcentaje)
    setProfitPercentageInput(
      settings.profit !== undefined ? (settings.profit * 100).toString() : ""
    );

    // Tasa BCV con 2 decimales
    setBcvRateInput(settings.bcv !== undefined ? settings.bcv.toFixed(2) : "");

    // Convertir porcentaje de IVA a % (de decimal a porcentaje)
    setIvaPercentageInput(
      settings.iva !== undefined ? (settings.iva * 100).toString() : ""
    );
  }, [settings]);

  // Actualizar porcentaje de ganancia
  const updateProfitPercentage = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    // Validar porcentaje
    const validation = validatePercentage(
      profitPercentageInput,
      "porcentaje de ganancia"
    );
    if (!validation.isValid) {
      notification.showError(validation.error);
      return;
    }

    try {
      const settingsProfitDocRef = doc(
        db,
        `artifacts/${appId}/public/data/settings`,
        "profit"
      );

      // Guardar como decimal (dividir por 100)
      await setDoc(
        settingsProfitDocRef,
        { percentage: validation.value / 100 },
        { merge: true }
      );

      notification.showSuccess(ADMIN_SUCCESS_MESSAGES.PROFIT_UPDATED);
    } catch (e) {
      console.error("Error updating profit percentage:", e);
      notification.showError("Error al actualizar el porcentaje de ganancia.");
    }
  }, [userId, profitPercentageInput, db, appId, notification]);

  // Actualizar tasa de dólar BCV
  const updateBcvRate = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    // Validar tasa BCV
    const validation = validateBcvRate(bcvRateInput);
    if (!validation.isValid) {
      notification.showError(validation.error);
      return;
    }

    try {
      const bcvRateDocRef = doc(
        db,
        `artifacts/${appId}/public/data/settings`,
        "bcvRate"
      );

      await setDoc(bcvRateDocRef, { rate: validation.value }, { merge: true });

      notification.showSuccess(ADMIN_SUCCESS_MESSAGES.BCV_UPDATED);
    } catch (e) {
      console.error("Error updating BCV rate:", e);
      notification.showError("Error al actualizar la tasa de dólar BCV.");
    }
  }, [userId, bcvRateInput, db, appId, notification]);

  // Actualizar porcentaje de IVA
  const updateIvaPercentage = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    // Validar porcentaje
    const validation = validatePercentage(
      ivaPercentageInput,
      "porcentaje de IVA"
    );
    if (!validation.isValid) {
      notification.showError(validation.error);
      return;
    }

    try {
      const ivaRateDocRef = doc(
        db,
        `artifacts/${appId}/public/data/settings`,
        "ivaRate"
      );

      // Guardar como decimal (dividir por 100)
      await setDoc(
        ivaRateDocRef,
        { percentage: validation.value / 100 },
        { merge: true }
      );

      notification.showSuccess(ADMIN_SUCCESS_MESSAGES.IVA_UPDATED);
    } catch (e) {
      console.error("Error updating IVA percentage:", e);
      notification.showError("Error al actualizar el porcentaje de IVA.");
    }
  }, [userId, ivaPercentageInput, db, appId, notification]);

  return {
    // Estados y funciones de porcentaje de ganancia
    profit: {
      profitPercentageInput,
      setProfitPercentageInput,
      profitPercentageData: settings?.profit || 0,
      updateProfitPercentage,
    },

    // Estados y funciones de tasa BCV
    bcv: {
      bcvRateInput,
      setBcvRateInput,
      bcvRateData: settings?.bcv || 0,
      updateBcvRate,
    },

    // Estados y funciones de porcentaje de IVA
    iva: {
      ivaPercentageInput,
      setIvaPercentageInput,
      ivaPercentageData: settings?.iva || 0,
      updateIvaPercentage,
    },
  };
}
