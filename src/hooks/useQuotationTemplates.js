/**
 * Hook para gestionar plantillas de cotizaciones
 * Proporciona funciones para trabajar con cotizaciones marcadas como plantillas
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { useFirebase } from '../context/FirebaseContext';

/**
 * Hook principal para trabajar con plantillas
 */
export const useQuotationTemplates = () => {
  const { db, appId, userId } = useFirebase();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga todas las plantillas del usuario
   * Ordenadas por usageCount descendente (más usadas primero)
   */
  const loadTemplates = useCallback(async () => {
    if (!userId || !db || !appId) return;

    setLoading(true);
    setError(null);

    try {
      const quotationsRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/quotations`
      );

      // Query simplificada: solo filtramos por isTemplate
      // El ordenamiento se hace en JavaScript para evitar índice compuesto
      const templatesQuery = query(
        quotationsRef,
        where('isTemplate', '==', true)
      );

      const snapshot = await getDocs(templatesQuery);
      const templatesList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // Ordenar localmente: primero por usageCount desc, luego por timestamp desc
        .sort((a, b) => {
          const usageDiff = (b.usageCount || 0) - (a.usageCount || 0);
          if (usageDiff !== 0) return usageDiff;

          // Si tienen el mismo usageCount, ordenar por fecha más reciente
          const aTime = a.timestamp?.toMillis?.() || 0;
          const bTime = b.timestamp?.toMillis?.() || 0;
          return bTime - aTime;
        });

      setTemplates(templatesList);
    } catch (err) {
      console.error('Error cargando plantillas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [db, appId, userId]);

  // Cargar plantillas automáticamente cuando el usuario está disponible
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  /**
   * Marca una cotización como plantilla
   */
  const markAsTemplate = useCallback(
    async (quotationId, templateName) => {
      if (!userId || !db || !appId) {
        throw new Error('Usuario no autenticado');
      }

      try {
        const quotationRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/quotations`,
          quotationId
        );

        await updateDoc(quotationRef, {
          isTemplate: true,
          templateName: templateName || '',
          updatedAt: Timestamp.now(),
        });

        // Recargar plantillas
        await loadTemplates();

        return { success: true };
      } catch (err) {
        console.error('Error marcando como plantilla:', err);
        throw err;
      }
    },
    [db, appId, userId, loadTemplates]
  );

  /**
   * Desmarca una cotización como plantilla
   */
  const unmarkAsTemplate = useCallback(
    async (quotationId) => {
      if (!userId || !db || !appId) {
        throw new Error('Usuario no autenticado');
      }

      try {
        const quotationRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/quotations`,
          quotationId
        );

        await updateDoc(quotationRef, {
          isTemplate: false,
          templateName: '',
          updatedAt: Timestamp.now(),
        });

        // Recargar plantillas
        await loadTemplates();

        return { success: true };
      } catch (err) {
        console.error('Error desmarcando plantilla:', err);
        throw err;
      }
    },
    [db, appId, userId, loadTemplates]
  );

  /**
   * Incrementa el contador de uso de una plantilla
   */
  const incrementUsageCount = useCallback(
    async (templateId) => {
      if (!userId || !db || !appId) {
        throw new Error('Usuario no autenticado');
      }

      try {
        const templateRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/quotations`,
          templateId
        );

        await updateDoc(templateRef, {
          usageCount: increment(1),
          lastUsedAt: Timestamp.now(),
        });

        return { success: true };
      } catch (err) {
        console.error('Error incrementando contador de uso:', err);
        throw err;
      }
    },
    [db, appId, userId]
  );

  /**
   * Crea una nueva cotización desde una plantilla
   * @param {string} templateId - ID de la plantilla
   * @param {string} newClientId - ID del cliente para la nueva cotización
   * @param {string} newClientName - Nombre del cliente
   * @param {string} newQuotationName - Nombre opcional para la nueva cotización
   */
  const duplicateFromTemplate = useCallback(
    async (templateId, newClientId, newClientName, newQuotationName = null) => {
      if (!userId || !db || !appId) {
        throw new Error('Usuario no autenticado');
      }

      try {
        // Obtener la plantilla original
        const templateRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/quotations`,
          templateId
        );
        const templateDoc = await getDocs(
          query(collection(db, `artifacts/${appId}/users/${userId}/quotations`), where('__name__', '==', templateId))
        );

        if (templateDoc.empty) {
          throw new Error('Plantilla no encontrada');
        }

        const templateData = templateDoc.docs[0].data();

        // Crear nueva cotización basada en la plantilla
        const quotationsRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/quotations`
        );

        const newQuotationData = {
          name: newQuotationName || `${templateData.templateName || templateData.name} (copia)`,
          clientId: newClientId,
          clientName: newClientName,
          items: templateData.items || [],
          grandTotals: templateData.grandTotals || {},
          timestamp: Timestamp.now(),
          updatedAt: Timestamp.now(),
          status: 'pending',
          // Campos de tracking de plantilla
          isTemplate: false,
          templateName: '',
          usageCount: 0,
          duplicatedFrom: templateId,
          createdVia: 'template',
        };

        const docRef = await addDoc(quotationsRef, newQuotationData);

        // Incrementar contador de uso de la plantilla
        await incrementUsageCount(templateId);

        return {
          success: true,
          quotationId: docRef.id,
          quotationData: newQuotationData,
        };
      } catch (err) {
        console.error('Error duplicando desde plantilla:', err);
        throw err;
      }
    },
    [db, appId, userId, incrementUsageCount]
  );

  /**
   * Actualiza el nombre de una plantilla
   */
  const updateTemplateName = useCallback(
    async (templateId, newName) => {
      if (!userId || !db || !appId) {
        throw new Error('Usuario no autenticado');
      }

      try {
        const templateRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/quotations`,
          templateId
        );

        await updateDoc(templateRef, {
          templateName: newName,
          updatedAt: Timestamp.now(),
        });

        // Recargar plantillas
        await loadTemplates();

        return { success: true };
      } catch (err) {
        console.error('Error actualizando nombre de plantilla:', err);
        throw err;
      }
    },
    [db, appId, userId, loadTemplates]
  );

  return {
    templates,
    loading,
    error,
    loadTemplates,
    markAsTemplate,
    unmarkAsTemplate,
    incrementUsageCount,
    duplicateFromTemplate,
    updateTemplateName,
  };
};

/**
 * Hook simplificado para obtener solo las plantillas
 */
export const useTemplates = () => {
  const { templates, loading, error, loadTemplates } = useQuotationTemplates();

  return {
    templates,
    loading,
    error,
    refresh: loadTemplates,
  };
};
