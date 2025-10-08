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
 */
export function usePaperManagement(papers, notification) {
  const { db, appId, userId } = useFirebase();

  // Estados de formulario para añadir nuevo papel
  const [newPaperName, setNewPaperName] = useState("");
  const [newPaperPrice, setNewPaperPrice] = useState("");

  // Estado de inputs para actualizar precios de papeles existentes
  const [paperPriceInputs, setPaperPriceInputs] = useState({});

  // Sincronizar los inputs con los precios actuales de papers
  useEffect(() => {
    const initialInputs = {};
    papers.forEach((paper) => {
      initialInputs[paper.id] =
        paper.pricePerSheet !== undefined ? paper.pricePerSheet.toString() : "";
    });
    setPaperPriceInputs(initialInputs);
  }, [papers]);

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
      // Verificar que no exista ya un papel con ese ID
      const docRef = doc(
        db,
        `artifacts/${appId}/public/data/papers`,
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
  }, [userId, newPaperName, newPaperPrice, db, appId, notification]);

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

      try {
        const docRef = doc(
          db,
          `artifacts/${appId}/public/data/papers`,
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
    [userId, paperPriceInputs, papers, db, appId, notification]
  );

  // Eliminar un tipo de papel
  const deletePaper = useCallback(
    async (paperId) => {
      if (!userId) {
        notification.showError(ADMIN_ERROR_MESSAGES.AUTH_REQUIRED);
        return;
      }

      try {
        await deleteDoc(
          doc(db, `artifacts/${appId}/public/data/papers`, paperId)
        );
        notification.showSuccess(ADMIN_SUCCESS_MESSAGES.PAPER_DELETED);
      } catch (e) {
        console.error("Error deleting paper type:", e);
        notification.showError("Error al eliminar el tipo de papel.");
      }
    },
    [userId, db, appId, notification]
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
