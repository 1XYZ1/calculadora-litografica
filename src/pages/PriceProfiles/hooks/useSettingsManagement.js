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
 *
 * @param {Object} settings - Configuraciones actuales
 * @param {Object} notification - Hook de notificaciones
 * @param {string} priceProfileId - ID del perfil de precios actual
 */
export function useSettingsManagement(settings, notification, priceProfileId) {
  const { db, appId, userId } = useFirebase();

  // Estados de inputs
  const [profitPercentageInput, setProfitPercentageInput] = useState("");
  const [bcvRateInput, setBcvRateInput] = useState("");
  const [ivaPercentageInput, setIvaPercentageInput] = useState("");

  // Estados de loading
  const [loadingProfit, setLoadingProfit] = useState(false);
  const [loadingBcv, setLoadingBcv] = useState(false);
  const [loadingIva, setLoadingIva] = useState(false);

  // Limpiar inputs cuando cambia el perfil
  // Los inputs siempre inician vacíos, mostrando solo el valor actual en el badge
  useEffect(() => {
    setProfitPercentageInput("");
    setBcvRateInput("");
    setIvaPercentageInput("");
  }, [priceProfileId]); // Solo cuando cambia el perfil

  // Actualizar porcentaje de ganancia
  const updateProfitPercentage = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
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

    setLoadingProfit(true);
    try {
      const settingsProfitDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/settings`,
        "profit"
      );

      // Guardar como decimal (dividir por 100)
      await setDoc(
        settingsProfitDocRef,
        { percentage: validation.value / 100 },
        { merge: true }
      );

      notification.showSuccess(
        `Porcentaje de ganancia actualizado a ${validation.value}%`
      );
    } catch (e) {
      console.error("Error updating profit percentage:", e);
      notification.showError("Error al actualizar el porcentaje de ganancia.");
    } finally {
      setLoadingProfit(false);
    }
  }, [userId, priceProfileId, profitPercentageInput, db, appId, notification]);

  // Actualizar tasa de dólar BCV
  const updateBcvRate = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    // Validar tasa BCV
    const validation = validateBcvRate(bcvRateInput);
    if (!validation.isValid) {
      notification.showError(validation.error);
      return;
    }

    setLoadingBcv(true);
    try {
      const bcvRateDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/settings`,
        "bcvRate"
      );

      await setDoc(bcvRateDocRef, { rate: validation.value }, { merge: true });

      notification.showSuccess(
        `Tasa BCV actualizada a Bs. ${validation.value.toFixed(2)}`
      );
    } catch (e) {
      console.error("Error updating BCV rate:", e);
      notification.showError("Error al actualizar la tasa de dólar BCV.");
    } finally {
      setLoadingBcv(false);
    }
  }, [userId, priceProfileId, bcvRateInput, db, appId, notification]);

  // Actualizar porcentaje de IVA
  const updateIvaPercentage = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
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

    setLoadingIva(true);
    try {
      const ivaRateDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/settings`,
        "ivaRate"
      );

      // Guardar como decimal (dividir por 100)
      await setDoc(
        ivaRateDocRef,
        { percentage: validation.value / 100 },
        { merge: true }
      );

      notification.showSuccess(
        `Porcentaje de IVA actualizado a ${validation.value}%`
      );
    } catch (e) {
      console.error("Error updating IVA percentage:", e);
      notification.showError("Error al actualizar el porcentaje de IVA.");
    } finally {
      setLoadingIva(false);
    }
  }, [userId, priceProfileId, ivaPercentageInput, db, appId, notification]);

  return {
    // Estados y funciones de porcentaje de ganancia
    profit: {
      profitPercentageInput,
      setProfitPercentageInput,
      profitPercentageData: settings?.profit || 0,
      updateProfitPercentage,
      loading: loadingProfit,
    },

    // Estados y funciones de tasa BCV
    bcv: {
      bcvRateInput,
      setBcvRateInput,
      bcvRateData: settings?.bcv || 0,
      updateBcvRate,
      loading: loadingBcv,
    },

    // Estados y funciones de porcentaje de IVA
    iva: {
      ivaPercentageInput,
      setIvaPercentageInput,
      ivaPercentageData: settings?.iva || 0,
      updateIvaPercentage,
      loading: loadingIva,
    },
  };
}
