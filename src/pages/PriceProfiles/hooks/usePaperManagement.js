import { useState, useEffect, useCallback } from "react";
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

  // Sincronizar los inputs con los precios actuales de papers
  // Solo sincronizar cuando cambia el perfil, NO cada vez que papers se actualiza
  // Esto evita que los inputs se sobrescriban mientras el usuario está editando
  useEffect(() => {
    const initialInputs = {};
    papers.forEach((paper) => {
      initialInputs[paper.id] =
        paper.pricePerSheet !== undefined ? paper.pricePerSheet.toString() : "";
    });
    setPaperPriceInputs(initialInputs);
  }, [priceProfileId]); // Solo cuando cambia el perfil

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
  };
}
