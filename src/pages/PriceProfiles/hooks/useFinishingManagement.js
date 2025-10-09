import { useState, useEffect, useCallback, useRef } from "react";
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
 *
 * @param {Object} finishingPrices - Precios de acabados actuales
 * @param {Object} notification - Hook de notificaciones
 * @param {string} priceProfileId - ID del perfil de precios actual
 */
export function useFinishingManagement(
  finishingPrices,
  notification,
  priceProfileId
) {
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

  // Estados de loading granulares por tipo de operación
  const [loadingItemId, setLoadingItemId] = useState(null);

  // Ref para rastrear si ya se inicializaron los valores
  const initializedRef = useRef(false);
  const lastProfileIdRef = useRef(null);

  // Sincronizar inputs con precios de Firestore solo cuando cambia el perfil
  useEffect(() => {
    // Si cambia el perfil, marcar como no inicializado
    if (lastProfileIdRef.current !== priceProfileId) {
      initializedRef.current = false;
      lastProfileIdRef.current = priceProfileId;
    }

    // Solo inicializar una vez por perfil y cuando tengamos datos
    if (!initializedRef.current && finishingPrices && Object.keys(finishingPrices).length > 0) {
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

      initializedRef.current = true;
    }
  }, [priceProfileId, finishingPrices]);

  // Sincronizar inputs con precios de Firestore
  // Solo sincronizar cuando cambia el perfil, NO cada vez que finishingPrices se actualiza
  // Esto evita que los inputs se reinicien mientras el usuario está editando
  // ELIMINADO: No sincronizar automáticamente. Los inputs son independientes hasta que el usuario guarde.

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

      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      // Validar precio
      const validation = validatePrice(priceInput, formatIdForMessage(id));
      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }

      setLoadingItemId(id);
      try {
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/finishingPrices`,
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
      } finally {
        setLoadingItemId(null);
      }
    },
    [userId, db, appId, notification, priceProfileId]
  );

  // Función para actualizar TODOS los precios de UV de una vez
  const updateAllUvPrices = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    // Validar todos los precios de UV antes de actualizar
    const uvEntries = Object.entries(uvPricesInput);
    const validatedPrices = {};

    for (const [key, value] of uvEntries) {
      const validation = validatePrice(value, formatIdForMessage(`uv_${key}`));
      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }
      validatedPrices[key] = validation.value;
    }

    setLoadingItemId("uv_all");
    try {
      // Actualizar todos los precios de UV en paralelo
      const updatePromises = Object.entries(validatedPrices).map(
        ([key, value]) => {
          const docRef = doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/finishingPrices`,
            `uv_${key}`
          );
          return setDoc(docRef, { price: value }, { merge: true });
        }
      );

      await Promise.all(updatePromises);
      notification.showSuccess(
        "Todos los precios de UV actualizados correctamente"
      );
    } catch (e) {
      console.error("Error updating UV prices:", e);
      notification.showError("Error al actualizar los precios de UV");
    } finally {
      setLoadingItemId(null);
    }
  }, [userId, db, appId, notification, priceProfileId, uvPricesInput]);

  // Función para actualizar TODOS los otros acabados de una vez
  const updateAllOtherFinishings = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    // Preparar todos los acabados a actualizar
    const finishingsToUpdate = {
      remate: rematePriceInput,
      laminado_mate: laminadoMatePriceInput,
      laminado_brillante: laminadoBrillantePriceInput,
      signado: signadoPriceInput,
      troquelado: troqueladoPriceInput,
    };

    // Validar todos los precios antes de actualizar
    const validatedPrices = {};

    for (const [id, value] of Object.entries(finishingsToUpdate)) {
      const validation = validatePrice(value, formatIdForMessage(id));
      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }
      validatedPrices[id] = validation.value;
    }

    setLoadingItemId("other_all");
    try {
      // Actualizar todos los acabados en paralelo
      const updatePromises = Object.entries(validatedPrices).map(
        ([id, value]) => {
          const docRef = doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/finishingPrices`,
            id
          );
          return setDoc(docRef, { price: value }, { merge: true });
        }
      );

      await Promise.all(updatePromises);
      notification.showSuccess("Todos los acabados actualizados correctamente");
    } catch (e) {
      console.error("Error updating finishing prices:", e);
      notification.showError("Error al actualizar los precios de acabados");
    } finally {
      setLoadingItemId(null);
    }
  }, [
    userId,
    db,
    appId,
    notification,
    priceProfileId,
    rematePriceInput,
    laminadoMatePriceInput,
    laminadoBrillantePriceInput,
    signadoPriceInput,
    troqueladoPriceInput,
  ]);

  // Función para actualizar AMBOS precios de impresión digital de una vez
  const updateAllDigitalPrinting = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED_ACTION);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    // Preparar precios digitales a actualizar
    const digitalPrices = {
      digital_quarter_tiro: digitalQuarterTiroInput,
      digital_quarter_tiro_retiro: digitalQuarterTiroRetiroInput,
    };

    // Validar ambos precios antes de actualizar
    const validatedPrices = {};

    for (const [id, value] of Object.entries(digitalPrices)) {
      const validation = validatePrice(value, formatIdForMessage(id));
      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }
      validatedPrices[id] = validation.value;
    }

    setLoadingItemId("digital_all");
    try {
      // Actualizar ambos precios digitales en paralelo
      const updatePromises = Object.entries(validatedPrices).map(
        ([id, value]) => {
          const docRef = doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/finishingPrices`,
            id
          );
          return setDoc(docRef, { price: value }, { merge: true });
        }
      );

      await Promise.all(updatePromises);
      notification.showSuccess(
        "Precios de impresión digital actualizados correctamente"
      );
    } catch (e) {
      console.error("Error updating digital printing prices:", e);
      notification.showError(
        "Error al actualizar los precios de impresión digital"
      );
    } finally {
      setLoadingItemId(null);
    }
  }, [
    userId,
    db,
    appId,
    notification,
    priceProfileId,
    digitalQuarterTiroInput,
    digitalQuarterTiroRetiroInput,
  ]);

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

    // Funciones de actualización
    updateFinishingPrice,
    updateAllUvPrices,
    updateAllOtherFinishings,
    updateAllDigitalPrinting,

    // Estado de loading granular por item
    loadingItemId,
  };
}
