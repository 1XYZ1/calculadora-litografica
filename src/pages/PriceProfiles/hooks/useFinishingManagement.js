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

  // Ref para rastrear el último perfil cargado y los últimos valores
  const lastProfileIdRef = useRef(null);
  const lastFinishingPricesRef = useRef({});

  // Sincronizar inputs con precios de Firestore cuando cambia el perfil
  useEffect(() => {
    // Si cambia el perfil o no hay perfil, resetear todos los inputs
    if (lastProfileIdRef.current !== priceProfileId) {
      lastProfileIdRef.current = priceProfileId;
      lastFinishingPricesRef.current = {};

      // Si no hay perfil seleccionado, limpiar todos los inputs
      if (!priceProfileId) {
        setUvPricesInput({
          half_sheet: "",
          quarter_sheet: "",
          tabloide: "",
          oficio: "",
          carta: "",
          quarter_sheet_digital: "",
        });
        setRematePriceInput("");
        setLaminadoMatePriceInput("");
        setLaminadoBrillantePriceInput("");
        setSignadoPriceInput("");
        setTroqueladoPriceInput("");
        setDigitalQuarterTiroInput("");
        setDigitalQuarterTiroRetiroInput("");
        return;
      }
    }

    // Solo actualizar inputs si los valores realmente cambiaron
    if (priceProfileId && finishingPrices && Object.keys(finishingPrices).length > 0) {
      const lastPrices = lastFinishingPricesRef.current;

      // Actualizar inputs de UV solo si cambiaron
      const uvKeys = ["uv_half_sheet", "uv_quarter_sheet", "uv_tabloide", "uv_oficio", "uv_carta", "uv_quarter_sheet_digital"];
      const uvChanged = uvKeys.some(key => finishingPrices[key] !== lastPrices[key]);

      if (uvChanged) {
        setUvPricesInput({
          half_sheet: finishingPrices["uv_half_sheet"]?.toString() || "",
          quarter_sheet: finishingPrices["uv_quarter_sheet"]?.toString() || "",
          tabloide: finishingPrices["uv_tabloide"]?.toString() || "",
          oficio: finishingPrices["uv_oficio"]?.toString() || "",
          carta: finishingPrices["uv_carta"]?.toString() || "",
          quarter_sheet_digital: finishingPrices["uv_quarter_sheet_digital"]?.toString() || "",
        });
      }

      // Actualizar otros acabados solo si cambiaron
      if (finishingPrices["remate"] !== lastPrices["remate"]) {
        setRematePriceInput(
          finishingPrices["remate"] !== undefined ? finishingPrices["remate"].toString() : ""
        );
      }

      if (finishingPrices["laminado_mate"] !== lastPrices["laminado_mate"]) {
        setLaminadoMatePriceInput(
          finishingPrices["laminado_mate"] !== undefined ? finishingPrices["laminado_mate"].toString() : ""
        );
      }

      if (finishingPrices["laminado_brillante"] !== lastPrices["laminado_brillante"]) {
        setLaminadoBrillantePriceInput(
          finishingPrices["laminado_brillante"] !== undefined ? finishingPrices["laminado_brillante"].toString() : ""
        );
      }

      if (finishingPrices["signado"] !== lastPrices["signado"]) {
        setSignadoPriceInput(
          finishingPrices["signado"] !== undefined ? finishingPrices["signado"].toString() : ""
        );
      }

      if (finishingPrices["troquelado"] !== lastPrices["troquelado"]) {
        setTroqueladoPriceInput(
          finishingPrices["troquelado"] !== undefined ? finishingPrices["troquelado"].toString() : ""
        );
      }

      // Actualizar inputs de impresión digital solo si cambiaron
      if (finishingPrices["digital_quarter_tiro"] !== lastPrices["digital_quarter_tiro"]) {
        setDigitalQuarterTiroInput(
          finishingPrices["digital_quarter_tiro"] !== undefined ? finishingPrices["digital_quarter_tiro"].toString() : ""
        );
      }

      if (finishingPrices["digital_quarter_tiro_retiro"] !== lastPrices["digital_quarter_tiro_retiro"]) {
        setDigitalQuarterTiroRetiroInput(
          finishingPrices["digital_quarter_tiro_retiro"] !== undefined ? finishingPrices["digital_quarter_tiro_retiro"].toString() : ""
        );
      }

      // Guardar referencia de los precios actuales
      lastFinishingPricesRef.current = { ...finishingPrices };
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

    // Validar solo los precios de UV que han cambiado realmente
    const uvEntries = Object.entries(uvPricesInput);
    const validatedPrices = {};
    const updatedUvSizes = [];

    for (const [key, value] of uvEntries) {
      if (!value) continue; // Skip empty inputs

      const currentPrice = finishingPrices?.[`uv_${key}`] || 0;
      const newPrice = parseFloat(value);

      // Solo validar y actualizar si hay un cambio real
      if (!isNaN(newPrice) && newPrice !== currentPrice) {
        const validation = validatePrice(value, formatIdForMessage(`uv_${key}`));
        if (!validation.isValid) {
          notification.showError(validation.error);
          return;
        }
        validatedPrices[key] = validation.value;
        updatedUvSizes.push(formatIdForMessage(`uv_${key}`));
      }
    }

    if (Object.keys(validatedPrices).length === 0) {
      notification.showError("No hay cambios pendientes para actualizar");
      return;
    }

    setLoadingItemId("uv_all");
    try {
      // Actualizar solo los precios de UV que cambiaron
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

      // Mensaje claro indicando qué tamaños de UV se actualizaron
      const count = updatedUvSizes.length;
      if (count === 1) {
        notification.showSuccess(`UV actualizado: ${updatedUvSizes[0]}`);
      } else if (count <= 3) {
        notification.showSuccess(
          `UV actualizados: ${updatedUvSizes.join(", ")}`
        );
      } else {
        notification.showSuccess(
          `${count} precios UV actualizados: ${updatedUvSizes.slice(0, 2).join(", ")} y ${count - 2} más`
        );
      }
    } catch (e) {
      console.error("Error updating UV prices:", e);
      notification.showError("Error al actualizar los precios de UV");
    } finally {
      setLoadingItemId(null);
    }
  }, [userId, db, appId, notification, priceProfileId, uvPricesInput, finishingPrices]);

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

    // Validar solo los precios que han cambiado realmente
    const validatedPrices = {};
    const updatedFinishingNames = [];

    for (const [id, value] of Object.entries(finishingsToUpdate)) {
      if (!value) continue; // Skip empty inputs

      const currentPrice = finishingPrices?.[id] || 0;
      const newPrice = parseFloat(value);

      // Solo validar y actualizar si hay un cambio real
      if (!isNaN(newPrice) && newPrice !== currentPrice) {
        const validation = validatePrice(value, formatIdForMessage(id));
        if (!validation.isValid) {
          notification.showError(validation.error);
          return;
        }
        validatedPrices[id] = validation.value;
        updatedFinishingNames.push(formatIdForMessage(id));
      }
    }

    if (Object.keys(validatedPrices).length === 0) {
      notification.showError("No hay cambios pendientes para actualizar");
      return;
    }

    setLoadingItemId("other_all");
    try {
      // Actualizar solo los acabados que cambiaron
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

      // Mensaje claro indicando qué acabados se actualizaron
      const count = updatedFinishingNames.length;
      if (count === 1) {
        notification.showSuccess(`Acabado actualizado: ${updatedFinishingNames[0]}`);
      } else if (count <= 3) {
        notification.showSuccess(
          `Acabados actualizados: ${updatedFinishingNames.join(", ")}`
        );
      } else {
        notification.showSuccess(
          `${count} acabados actualizados: ${updatedFinishingNames.slice(0, 2).join(", ")} y ${count - 2} más`
        );
      }
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
    finishingPrices,
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

    // Validar solo los precios que han cambiado realmente
    const validatedPrices = {};
    const updatedDigitalNames = [];

    for (const [id, value] of Object.entries(digitalPrices)) {
      if (!value) continue; // Skip empty inputs

      const currentPrice = finishingPrices?.[id] || 0;
      const newPrice = parseFloat(value);

      // Solo validar y actualizar si hay un cambio real
      if (!isNaN(newPrice) && newPrice !== currentPrice) {
        const validation = validatePrice(value, formatIdForMessage(id));
        if (!validation.isValid) {
          notification.showError(validation.error);
          return;
        }
        validatedPrices[id] = validation.value;
        updatedDigitalNames.push(formatIdForMessage(id));
      }
    }

    if (Object.keys(validatedPrices).length === 0) {
      notification.showError("No hay cambios pendientes para actualizar");
      return;
    }

    setLoadingItemId("digital_all");
    try {
      // Actualizar solo los precios digitales que cambiaron
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

      // Mensaje claro indicando qué precios digitales se actualizaron
      const count = updatedDigitalNames.length;
      if (count === 1) {
        notification.showSuccess(`Precio digital actualizado: ${updatedDigitalNames[0]}`);
      } else {
        notification.showSuccess(
          `Precios digitales actualizados: ${updatedDigitalNames.join(", ")}`
        );
      }
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
    finishingPrices,
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
