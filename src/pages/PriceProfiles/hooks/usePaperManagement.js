import { useState, useEffect, useCallback, useRef } from "react";
import { doc, updateDoc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import {
  validateNewPaper,
  validatePrice,
  generatePaperId,
} from "../utils/priceValidation";
import {
  ADMIN_ERROR_MESSAGES,
  ADMIN_SUCCESS_MESSAGES,
} from "../../../utils/constants";

/**
 * Hook para gestionar operaciones CRUD de tipos de papel
 * Maneja estados de formulario, validaciones y operaciones con Firestore
 *
 * @param {Array} papers - Lista de papeles del perfil actual
 * @param {Object} notification - Hook de notificaciones
 * @param {string} priceProfileId - ID del perfil de precios actual
 */
export function usePaperManagement(papers, notification, priceProfileId) {
  const { db, appId, userId } = useFirebase();

  // Estados de formulario para añadir nuevo papel
  const [newPaperName, setNewPaperName] = useState("");
  const [newPaperPrice, setNewPaperPrice] = useState("");

  // Estado de inputs para actualizar precios de papeles existentes
  const [paperPriceInputs, setPaperPriceInputs] = useState({});

  // Ref para rastrear si ya se inicializaron los valores
  const initializedRef = useRef(false);
  const lastProfileIdRef = useRef(null);

  // Reiniciar formulario de nuevo papel cuando cambia el perfil
  useEffect(() => {
    setNewPaperName("");
    setNewPaperPrice("");
  }, [priceProfileId]);

  // Sincronizar los inputs con los precios actuales de papers
  // Solo sincronizar una vez por perfil cuando los datos se cargan
  useEffect(() => {
    // Si cambia el perfil, marcar como no inicializado
    if (lastProfileIdRef.current !== priceProfileId) {
      initializedRef.current = false;
      lastProfileIdRef.current = priceProfileId;
      setPaperPriceInputs({});
    }

    // Solo inicializar una vez por perfil y cuando tengamos datos
    if (!initializedRef.current && papers.length > 0) {
      const initialInputs = {};
      papers.forEach((paper) => {
        initialInputs[paper.id] =
          paper.pricePerSheet !== undefined ? paper.pricePerSheet.toString() : "";
      });
      setPaperPriceInputs(initialInputs);
      initializedRef.current = true;
    }
  }, [priceProfileId, papers]);

  // Handler para cambiar el precio de un papel existente
  const handlePaperPriceInputChange = useCallback((paperId, value) => {
    setPaperPriceInputs((prev) => ({ ...prev, [paperId]: value }));
  }, []);

  // Añadir un nuevo tipo de papel
  const addPaper = useCallback(async () => {
    if (!userId) {
      notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED);
      return;
    }

    // Validar nombre y precio
    const validation = validateNewPaper(newPaperName, newPaperPrice);
    if (!validation.isValid) {
      notification.showError(validation.error);
      return;
    }

    // Generar ID a partir del nombre
    const generatedId = generatePaperId(newPaperName);
    if (!generatedId) {
      notification.showError(ADMIN_ERROR_MESSAGES.INVALID_NAME);
      return;
    }

    try {
      if (!priceProfileId) {
        notification.showError("Debe seleccionar un perfil de precios");
        return;
      }

      // Verificar que no exista ya un papel con ese ID
      const docRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}/papers`,
        generatedId
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        notification.showError(ADMIN_ERROR_MESSAGES.PAPER_EXISTS);
        return;
      }

      // Crear el nuevo documento
      await setDoc(docRef, {
        name: newPaperName.trim(),
        pricePerSheet: validation.price,
      });

      notification.showSuccess(ADMIN_SUCCESS_MESSAGES.PAPER_ADDED);

      // Limpiar formulario
      setNewPaperName("");
      setNewPaperPrice("");
    } catch (e) {
      console.error("Error adding paper type:", e);
      notification.showError("Error al añadir el nuevo tipo de papel.");
    }
  }, [
    userId,
    newPaperName,
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
    newPaperName,
    setNewPaperName,
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
