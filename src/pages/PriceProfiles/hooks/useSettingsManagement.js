import { useState, useEffect, useCallback, useRef } from "react";
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

  // Ref para rastrear el último perfil cargado y los últimos valores de settings
  const lastProfileIdRef = useRef(null);
  const lastSettingsRef = useRef({ profit: undefined, bcv: undefined, iva: undefined });

  // Sincronizar inputs con datos de settings cuando cambia el perfil o los valores reales
  useEffect(() => {
    // Si cambia el perfil, resetear inputs
    if (lastProfileIdRef.current !== priceProfileId) {
      lastProfileIdRef.current = priceProfileId;

      // Si no hay perfil seleccionado, limpiar todos los inputs
      if (!priceProfileId) {
        setProfitPercentageInput("");
        setBcvRateInput("");
        setIvaPercentageInput("");
        lastSettingsRef.current = { profit: undefined, bcv: undefined, iva: undefined };
        return;
      }
    }

    // Solo actualizar inputs si los valores realmente cambiaron
    if (priceProfileId && settings) {
      const { profit, bcv, iva } = settings;
      const lastSettings = lastSettingsRef.current;

      // Actualizar profit solo si cambió
      if (profit !== lastSettings.profit) {
        setProfitPercentageInput(
          profit !== undefined && profit !== 0
            ? (profit * 100).toString()
            : ""
        );
        lastSettings.profit = profit;
      }

      // Actualizar bcv solo si cambió
      if (bcv !== lastSettings.bcv) {
        setBcvRateInput(
          bcv !== undefined && bcv !== 0 ? bcv.toString() : ""
        );
        lastSettings.bcv = bcv;
      }

      // Actualizar iva solo si cambió
      if (iva !== lastSettings.iva) {
        setIvaPercentageInput(
          iva !== undefined && iva !== 0 ? (iva * 100).toString() : ""
        );
        lastSettings.iva = iva;
      }
    }
  }, [priceProfileId, settings]);

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
