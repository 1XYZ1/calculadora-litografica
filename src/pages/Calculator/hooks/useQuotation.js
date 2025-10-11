import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { initialQuotationState, MESSAGES } from "../../../utils/constants";
import { generateColorsDescription } from "../../../utils/calculationEngine";

/**
 * Hook para gestionar la cotización completa (items, totales, guardado)
 */
export const useQuotation = ({
  db,
  appId,
  userId,
  bcvRate,
  loadedQuotation,
  setLoadedQuotation,
}) => {
  const [mainQuotationName, setMainQuotationName] = useState(
    initialQuotationState.mainQuotationName
  );
  const [clientName, setClientName] = useState(
    initialQuotationState.clientName
  );
  const [clientId, setClientId] = useState(null);
  const [items, setItems] = useState(initialQuotationState.items);
  const [grandTotals, setGrandTotals] = useState(
    initialQuotationState.grandTotals
  );
  const [editingQuotationId, setEditingQuotationId] = useState(null);

  // Cargar cotización existente si se proporciona
  useEffect(() => {
    if (loadedQuotation) {
      setMainQuotationName(loadedQuotation.name || "");
      setClientName(loadedQuotation.clientName || "");
      setClientId(loadedQuotation.clientId || null);
      setItems(loadedQuotation.items || []);
      setEditingQuotationId(loadedQuotation.id);
      setLoadedQuotation(null);
    }
  }, [loadedQuotation, setLoadedQuotation]);

  // Calcular totales cuando cambian los items o la tasa BCV
  useEffect(() => {
    const total = items.reduce((acc, item) => acc + item.totalGeneral, 0);
    setGrandTotals({
      totalGeneral: total,
      totalCostInBs: bcvRate > 0 ? total * bcvRate : 0,
    });
  }, [items, bcvRate]);

  // Agregar o actualizar item
  const addOrUpdateItem = useCallback(
    (currentItem, itemResult, editingItemId) => {
      if (!currentItem.totalPieces || itemResult.totalGeneral === 0) {
        return {
          success: false,
          message: MESSAGES.ERROR_INCOMPLETE_ITEM,
        };
      }

      // Generar descripción de colores
      const colorsDescription = generateColorsDescription({
        numColorsTiro: currentItem.numColorsTiro,
        numColorsRetiro: currentItem.numColorsRetiro,
        isTiroRetiro: currentItem.isTiroRetiro,
        isWorkAndTurn: currentItem.isWorkAndTurn,
      });

      const itemWithResult = {
        ...currentItem,
        ...itemResult,
        colorsDescription,
      };

      if (editingItemId) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItemId ? itemWithResult : item
          )
        );
        return {
          success: true,
          message: MESSAGES.SUCCESS_ITEM_UPDATED,
        };
      } else {
        setItems((prev) => [...prev, itemWithResult]);
        return {
          success: true,
          message: "",
        };
      }
    },
    []
  );

  // Editar item existente
  const editItem = useCallback((item) => {
    return item;
  }, []);

  // Eliminar item
  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Resetear cotización completa
  const resetQuotation = useCallback(() => {
    setMainQuotationName(initialQuotationState.mainQuotationName);
    setClientName(initialQuotationState.clientName);
    setClientId(null);
    setItems(initialQuotationState.items);
    setGrandTotals(initialQuotationState.grandTotals);
    setEditingQuotationId(null);
  }, []);

  // Guardar nueva cotización
  const saveQuotation = useCallback(async () => {
    if (!userId) {
      return { success: false, message: MESSAGES.ERROR_NO_AUTH };
    }
    if (items.length === 0) {
      return { success: false, message: MESSAGES.ERROR_NO_ITEMS };
    }
    if (!clientId) {
      return { success: false, message: "Debe seleccionar un cliente" };
    }

    try {
      const quotationsCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/quotations`
      );

      const quotationData = {
        name: mainQuotationName,
        clientName,
        clientId,
        timestamp: Timestamp.now(),
        items,
        grandTotals,
        status: "pending", // Estado inicial para nuevas cotizaciones
        // Nuevos campos de la migración
        isTemplate: false,
        templateName: "",
        usageCount: 0,
        duplicatedFrom: null,
        createdVia: "manual",
      };

      await addDoc(quotationsCollectionRef, quotationData);

      return {
        success: true,
        message: MESSAGES.SUCCESS_SAVED(mainQuotationName),
        shouldReset: true,
      };
    } catch (e) {
      console.error("Error saving quotation: ", e);
      return { success: false, message: "Error al guardar la cotización." };
    }
  }, [
    userId,
    items,
    db,
    appId,
    mainQuotationName,
    clientName,
    clientId,
    grandTotals,
  ]);

  // Actualizar cotización existente
  const updateQuotation = useCallback(async () => {
    if (!userId || !editingQuotationId) {
      return { success: false, message: MESSAGES.ERROR_NOT_EDITING };
    }
    if (items.length === 0) {
      return { success: false, message: MESSAGES.ERROR_NO_ITEMS };
    }
    if (!clientId) {
      return { success: false, message: "Debe seleccionar un cliente" };
    }

    try {
      const quotationDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/quotations`,
        editingQuotationId
      );

      const quotationData = {
        name: mainQuotationName,
        clientName,
        clientId,
        timestamp: Timestamp.now(),
        items,
        grandTotals,
        // Mantener campos existentes de template si existen, si no, usar defaults
        isTemplate: false,
        templateName: "",
        usageCount: 0,
      };

      await updateDoc(quotationDocRef, quotationData);

      return {
        success: true,
        message: MESSAGES.SUCCESS_UPDATED(mainQuotationName),
        shouldReset: true,
      };
    } catch (e) {
      console.error("Error updating quotation: ", e);
      return { success: false, message: "Error al actualizar la cotización." };
    }
  }, [
    userId,
    editingQuotationId,
    items,
    db,
    appId,
    mainQuotationName,
    clientName,
    clientId,
    grandTotals,
  ]);

  // Cargar cotización desde plantilla
  const loadFromTemplate = useCallback((templateData, newClientId, newClientName, newQuotationName = null) => {
    if (!templateData) return;

    setClientId(newClientId);
    setClientName(newClientName);
    setMainQuotationName(
      newQuotationName || `${templateData.templateName || templateData.name} (desde plantilla)`
    );
    setEditingQuotationId(null); // Nueva cotización, no edición
    // Los items se cargarán desde templateData.items
  }, [setClientId, setClientName, setMainQuotationName, setEditingQuotationId]);

  return {
    mainQuotationName,
    setMainQuotationName,
    clientName,
    setClientName,
    clientId,
    setClientId,
    items,
    grandTotals,
    editingQuotationId,
    addOrUpdateItem,
    editItem,
    removeItem,
    resetQuotation,
    saveQuotation,
    updateQuotation,
    loadFromTemplate,
  };
};
