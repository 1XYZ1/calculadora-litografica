import { useState, useEffect, useCallback } from "react";
import { doc, setDoc } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import { validatePrice, formatIdForMessage } from "../utils/priceValidation";
import {
  ADMIN_ERROR_MESSAGES,
  ADMIN_SUCCESS_MESSAGES,
} from "../../../utils/constants";

/**
 * Hook para gestionar precios de acabados (UV, laminados, remate, etc.)
 * y precios de impresión digital
 */
export function useFinishingManagement(finishingPrices, notification) {
  const { db, appId, userId } = useFirebase();

  // Estados de inputs para precios de UV por tamaño
  const [uvPricesInput, setUvPricesInput] = useState({
    half_sheet: "",
    quarter_sheet: "",
    tabloide: "",
    oficio: "",
    carta: "",
    quarter_sheet_digital: "",
  });

  // Estados de inputs para otros acabados
  const [rematePriceInput, setRematePriceInput] = useState("");
  const [laminadoMatePriceInput, setLaminadoMatePriceInput] = useState("");
  const [laminadoBrillantePriceInput, setLaminadoBrillantePriceInput] =
    useState("");
  const [signadoPriceInput, setSignadoPriceInput] = useState("");
  const [troqueladoPriceInput, setTroqueladoPriceInput] = useState("");

  // Estados de inputs para impresión digital
  const [digitalQuarterTiroInput, setDigitalQuarterTiroInput] = useState("");
  const [digitalQuarterTiroRetiroInput, setDigitalQuarterTiroRetiroInput] =
    useState("");

  // Sincronizar inputs con precios de Firestore
  useEffect(() => {
    if (!finishingPrices) return;

    // Actualizar inputs de UV
    setUvPricesInput({
      half_sheet: finishingPrices["uv_half_sheet"]?.toString() || "",
      quarter_sheet: finishingPrices["uv_quarter_sheet"]?.toString() || "",
      tabloide: finishingPrices["uv_tabloide"]?.toString() || "",
      oficio: finishingPrices["uv_oficio"]?.toString() || "",
      carta: finishingPrices["uv_carta"]?.toString() || "",
      quarter_sheet_digital:
        finishingPrices["uv_quarter_sheet_digital"]?.toString() || "",
    });

    // Actualizar otros acabados
    setRematePriceInput(
      finishingPrices["remate"] !== undefined
        ? finishingPrices["remate"].toString()
        : ""
    );
    setLaminadoMatePriceInput(
      finishingPrices["laminado_mate"] !== undefined
        ? finishingPrices["laminado_mate"].toString()
        : ""
    );
    setLaminadoBrillantePriceInput(
      finishingPrices["laminado_brillante"] !== undefined
        ? finishingPrices["laminado_brillante"].toString()
        : ""
    );
    setSignadoPriceInput(
      finishingPrices["signado"] !== undefined
        ? finishingPrices["signado"].toString()
        : ""
    );
    setTroqueladoPriceInput(
      finishingPrices["troquelado"] !== undefined
        ? finishingPrices["troquelado"].toString()
        : ""
    );

    // Actualizar inputs de impresión digital
    setDigitalQuarterTiroInput(
      finishingPrices["digital_quarter_tiro"] !== undefined
        ? finishingPrices["digital_quarter_tiro"].toString()
        : ""
    );
    setDigitalQuarterTiroRetiroInput(
      finishingPrices["digital_quarter_tiro_retiro"] !== undefined
        ? finishingPrices["digital_quarter_tiro_retiro"].toString()
        : ""
    );
  }, [finishingPrices]);

  // Handler para cambiar precios de UV
  const handleUvPriceChange = useCallback((size, value) => {
    setUvPricesInput((prev) => ({ ...prev, [size]: value }));
  }, []);

  // Función genérica para actualizar cualquier precio de acabado
  const updateFinishingPrice = useCallback(
    async (id, priceInput) => {
      if (!userId) {
        notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
        return;
      }

      // Validar precio
      const validation = validatePrice(priceInput, formatIdForMessage(id));
      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }

      try {
        const docRef = doc(
          db,
          `artifacts/${appId}/public/data/finishingPrices`,
          id
        );
        await setDoc(docRef, { price: validation.value }, { merge: true });
        notification.showSuccess(
          ADMIN_SUCCESS_MESSAGES.FINISHING_UPDATED(formatIdForMessage(id))
        );
      } catch (e) {
        console.error(`Error updating ${id} price:`, e);
        notification.showError(
          `Error al actualizar el precio de ${formatIdForMessage(id)}.`
        );
      }
    },
    [userId, db, appId, notification]
  );

  return {
    // Inputs de UV
    uvPricesInput,
    handleUvPriceChange,

    // Inputs de otros acabados
    rematePriceInput,
    setRematePriceInput,
    laminadoMatePriceInput,
    setLaminadoMatePriceInput,
    laminadoBrillantePriceInput,
    setLaminadoBrillantePriceInput,
    signadoPriceInput,
    setSignadoPriceInput,
    troqueladoPriceInput,
    setTroqueladoPriceInput,

    // Inputs de impresión digital
    digitalQuarterTiroInput,
    setDigitalQuarterTiroInput,
    digitalQuarterTiroRetiroInput,
    setDigitalQuarterTiroRetiroInput,

    // Función de actualización
    updateFinishingPrice,
  };
}
