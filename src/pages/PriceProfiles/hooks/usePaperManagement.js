import { useState, useEffect, useCallback, useRef } from "react";
import { doc, updateDoc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import {
  validatePrice,
} from "../utils/priceValidation";
import {
  ADMIN_ERROR_MESSAGES,
  ADMIN_SUCCESS_MESSAGES,
  PAPER_TYPE_OPTIONS,
} from "../../../utils/constants";

/**
 * Hook para gestionar operaciones CRUD de tipos de papel
 * Maneja estados de formulario, validaciones y operaciones con Firestore
 * **Sistema de opciones fijas (enum-like) - ID del documento = tipo de papel**
 *
 * @param {Array} papers - Lista de papeles del perfil actual
 * @param {Object} notification - Hook de notificaciones
 * @param {string} priceProfileId - ID del perfil de precios actual
 */
export function usePaperManagement(papers, notification, priceProfileId) {
  const { db, appId, userId } = useFirebase();

  // Estados de formulario para añadir nuevo papel
  const [newPaperType, setNewPaperType] = useState(""); // Cambiado de newPaperName
  const [newPaperPrice, setNewPaperPrice] = useState("");

  // Estado de inputs para actualizar precios de papeles existentes
  const [paperPriceInputs, setPaperPriceInputs] = useState({});

  // Ref para rastrear el último perfil cargado y los últimos valores
  const lastProfileIdRef = useRef(null);
  const lastPapersRef = useRef([]);

  // Reiniciar formulario de nuevo papel cuando cambia el perfil
  useEffect(() => {
    setNewPaperType("");
    setNewPaperPrice("");
  }, [priceProfileId]);

  // Sincronizar los inputs con los precios actuales de papers
  useEffect(() => {
    // Si cambia el perfil, resetear inputs
    if (lastProfileIdRef.current !== priceProfileId) {
      lastProfileIdRef.current = priceProfileId;
      setPaperPriceInputs({});
      lastPapersRef.current = [];

      // Si no hay perfil, no continuar
      if (!priceProfileId) {
        return;
      }
    }

    // Solo actualizar inputs si los valores realmente cambiaron
    if (priceProfileId && papers.length > 0) {
      const lastPapers = lastPapersRef.current;
      let hasChanges = false;

      // Verificar si hay cambios reales en los precios
      if (papers.length !== lastPapers.length) {
        hasChanges = true;
      } else {
        hasChanges = papers.some(paper => {
          const lastPaper = lastPapers.find(p => p.id === paper.id);
          return !lastPaper || lastPaper.pricePerSheet !== paper.pricePerSheet;
        });
      }

      // Solo actualizar si hay cambios
      if (hasChanges) {
        const initialInputs = {};
        papers.forEach((paper) => {
          initialInputs[paper.id] =
            paper.pricePerSheet !== undefined ? paper.pricePerSheet.toString() : "";
        });
        setPaperPriceInputs(initialInputs);
        lastPapersRef.current = papers.map(p => ({ ...p }));
      }
    }
  }, [priceProfileId, papers]);

  // Handler para cambiar el precio de un papel existente
  const handlePaperPriceInputChange = useCallback((paperId, value) => {
    setPaperPriceInputs((prev) => ({ ...prev, [paperId]: value }));
  }, []);

  // Añadir un nuevo tipo de papel (usando tipos fijos de PAPER_TYPE_OPTIONS)
  const addPaper = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED);
      return;
    }

    // Validar que se haya seleccionado un tipo
    if (!newPaperType) {
      notification.showError("Debe seleccionar un tipo de papel");
      return;
    }

    // Validar precio
    const paperOption = PAPER_TYPE_OPTIONS.find(p => p.value === newPaperType);
    const validation = validatePrice(newPaperPrice, paperOption?.label || "Papel");
    if (!validation.isValid) {
      notification.showError(validation.error);
      return;
    }

    try {
      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      // El ID del documento ES el tipo de papel (fijo)
      const docRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/papers`,
        newPaperType // ID fijo basado en el tipo
      );

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        notification.showError("Este tipo de papel ya existe en este perfil");
        return;
      }

      // Crear el nuevo documento con ID fijo
      await setDoc(docRef, {
        type: newPaperType,
        label: paperOption.label,
        defaultGramaje: paperOption.defaultGramaje,
        pricePerSheet: validation.price,
      });

      notification.showSuccess(ADMIN_SUCCESS_MESSAGES.PAPER_ADDED);

      // Limpiar formulario
      setNewPaperType("");
      setNewPaperPrice("");
    } catch (e) {
      console.error("Error adding paper type:", e);
      notification.showError("Error al añadir el nuevo tipo de papel.");
    }
  }, [
    userId,
    newPaperType,
    newPaperPrice,
    db,
    appId,
    notification,
    priceProfileId,
  ]);

  // Actualizar el precio de un papel existente
  const updatePaperPrice = useCallback(
    async (paperId) => {
      if (!userId) {
        notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED);
        return;
      }

      const priceStr = paperPriceInputs[paperId];
      const paperName = papers.find((p) => p.id === paperId)?.name;

      // Validar precio
      const validation = validatePrice(priceStr, paperName);
      if (!validation.isValid) {
        notification.showError(validation.error);
        return;
      }

      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      try {
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/papers`,
          paperId
        );
        await updateDoc(docRef, { pricePerSheet: validation.value });
        notification.showSuccess(
          ADMIN_SUCCESS_MESSAGES.PAPER_UPDATED(paperName)
        );
      } catch (e) {
        console.error("Error updating paper price:", e);
        notification.showError("Error al actualizar el precio del papel.");
      }
    },
    [userId, paperPriceInputs, papers, db, appId, notification, priceProfileId]
  );

  // Eliminar un tipo de papel
  const deletePaper = useCallback(
    async (paperId) => {
      if (!userId) {
        notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED);
        return;
      }

      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/papers`,
            paperId
          )
        );
        notification.showSuccess(ADMIN_SUCCESS_MESSAGES.PAPER_DELETED);
      } catch (e) {
        console.error("Error deleting paper type:", e);
        notification.showError("Error al eliminar el tipo de papel.");
      }
    },
    [userId, db, appId, notification, priceProfileId]
  );

  // Estado de loading para actualización masiva
  const [loadingAll, setLoadingAll] = useState(false);

  // Función para actualizar TODOS los precios de papeles de una vez
  const updateAllPaperPrices = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED);
      return;
    }

    if (!priceProfileId) {
      notification.showError("Debe seleccionar un perfil de precios");
      return;
    }

    // Validar solo los precios que han cambiado realmente
    const validatedPrices = {};
    const updatedPaperNames = [];

    for (const [paperId, value] of Object.entries(paperPriceInputs)) {
      if (!value) continue; // Skip empty inputs

      const paper = papers.find((p) => p.id === paperId);
      const paperName = paper?.name;

      // Comparar con el valor actual para solo actualizar lo que cambió
      const currentPrice = paper?.pricePerSheet || 0;
      const newPrice = parseFloat(value);

      // Solo validar y actualizar si hay un cambio real
      if (!isNaN(newPrice) && newPrice !== currentPrice) {
        const validation = validatePrice(value, paperName);

        if (!validation.isValid) {
          notification.showError(validation.error);
          return;
        }
        validatedPrices[paperId] = validation.value;
        updatedPaperNames.push(paperName);
      }
    }

    if (Object.keys(validatedPrices).length === 0) {
      notification.showError("No hay cambios pendientes para actualizar");
      return;
    }

    setLoadingAll(true);
    try {
      // Actualizar solo los precios que cambiaron
      const updatePromises = Object.entries(validatedPrices).map(
        ([paperId, value]) => {
          const docRef = doc(
            db,
            `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/papers`,
            paperId
          );
          return updateDoc(docRef, { pricePerSheet: value });
        }
      );

      await Promise.all(updatePromises);

      // Mensaje claro indicando qué papeles se actualizaron
      const count = updatedPaperNames.length;
      if (count === 1) {
        notification.showSuccess(`Papel actualizado: ${updatedPaperNames[0]}`);
      } else if (count <= 3) {
        notification.showSuccess(
          `Papeles actualizados: ${updatedPaperNames.join(", ")}`
        );
      } else {
        notification.showSuccess(
          `${count} papeles actualizados: ${updatedPaperNames.slice(0, 2).join(", ")} y ${count - 2} más`
        );
      }
    } catch (e) {
      console.error("Error updating paper prices:", e);
      notification.showError("Error al actualizar los precios de papel");
    } finally {
      setLoadingAll(false);
    }
  }, [
    userId,
    paperPriceInputs,
    papers,
    db,
    appId,
    notification,
    priceProfileId,
  ]);

  return {
    // Estados de formulario
    newPaperType, // Cambiado de newPaperName
    setNewPaperType, // Cambiado de setNewPaperName
    newPaperPrice,
    setNewPaperPrice,
    paperPriceInputs,

    // Handlers
    handlePaperPriceInputChange,
    addPaper,
    updatePaperPrice,
    deletePaper,
    updateAllPaperPrices,

    // Loading states
    loadingAll,
  };
}
