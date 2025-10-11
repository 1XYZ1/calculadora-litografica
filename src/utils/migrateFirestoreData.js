/**
 * Script de migración para actualizar schemas de Firestore
 * Agrega nuevos campos a las colecciones existentes sin afectar datos actuales
 *
 * Ejecutar desde la consola del navegador o como función standalone
 */

import { collection, getDocs, updateDoc, doc, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { PAPER_TYPE_OPTIONS } from './constants';

/**
 * Migra la colección de quotations agregando nuevos campos
 * Nuevos campos: isTemplate, templateName, usageCount, duplicatedFrom, createdVia
 */
export const migrateQuotations = async (db, appId, userId) => {
  try {
    console.log('🔄 Iniciando migración de quotations...');

    const quotationsRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/quotations`
    );    const snapshot = await getDocs(quotationsRef);
    const batch = writeBatch(db);
    let migratedCount = 0;
    let skippedCount = 0;

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      // Solo migrar si no tiene los nuevos campos
      if (!data.hasOwnProperty('isTemplate')) {
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/quotations`,
          docSnapshot.id
        );

        batch.update(docRef, {
          isTemplate: false,
          templateName: '',
          usageCount: 0,
          duplicatedFrom: null,
          createdVia: 'manual', // Asumimos que las existentes son manuales
        });

        migratedCount++;
      } else {
        skippedCount++;
      }
    });

    await batch.commit();

    console.log(`✅ Migración de quotations completada:`);
    console.log(`   - Documentos migrados: ${migratedCount}`);
    console.log(`   - Documentos omitidos (ya migrados): ${skippedCount}`);

    return { success: true, migratedCount, skippedCount };
  } catch (error) {
    console.error('❌ Error migrando quotations:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Migra la colección de clients agregando nuevos campos
 * Nuevos campos: quotationCount, lastQuotationDate, totalRevenue
 */
export const migrateClients = async (db, appId, userId) => {
  try {
    console.log('🔄 Iniciando migración de clients...');

    const clientsRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/clients`
    );    const snapshot = await getDocs(clientsRef);
    const batch = writeBatch(db);
    let migratedCount = 0;
    let skippedCount = 0;

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      // Solo migrar si no tiene los nuevos campos
      if (!data.hasOwnProperty('quotationCount')) {
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/clients`,
          docSnapshot.id
        );

        batch.update(docRef, {
          quotationCount: 0,
          lastQuotationDate: null,
          totalRevenue: 0,
        });

        migratedCount++;
      } else {
        skippedCount++;
      }
    });

    await batch.commit();

    console.log(`✅ Migración de clients completada:`);
    console.log(`   - Documentos migrados: ${migratedCount}`);
    console.log(`   - Documentos omitidos (ya migrados): ${skippedCount}`);

    return { success: true, migratedCount, skippedCount };
  } catch (error) {
    console.error('❌ Error migrando clients:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Recalcula las estadísticas de clientes basándose en cotizaciones existentes
 * Actualiza: quotationCount, lastQuotationDate, totalRevenue
 */
export const recalculateClientStats = async (db, appId, userId) => {
  try {
    console.log('🔄 Recalculando estadísticas de clientes...');

    // Obtener todas las cotizaciones
    const quotationsRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/quotations`
    );
    const quotationsSnapshot = await getDocs(quotationsRef);

    // Agrupar cotizaciones por cliente
    const clientStats = {};

    quotationsSnapshot.forEach((docSnapshot) => {
      const quotation = docSnapshot.data();
      const clientId = quotation.clientId;

      if (!clientId) return; // Saltar si no tiene clientId

      if (!clientStats[clientId]) {
        clientStats[clientId] = {
          quotationCount: 0,
          lastQuotationDate: null,
          totalRevenue: 0,
        };
      }

      // Incrementar contador
      clientStats[clientId].quotationCount++;

      // Actualizar última fecha
      const quotationDate = quotation.timestamp?.toDate() || new Date();
      if (
        !clientStats[clientId].lastQuotationDate ||
        quotationDate > clientStats[clientId].lastQuotationDate
      ) {
        clientStats[clientId].lastQuotationDate = quotationDate;
      }

      // Sumar ingresos (solo cotizaciones aprobadas)
      if (quotation.status === 'approved' && quotation.grandTotals?.totalGeneral) {
        clientStats[clientId].totalRevenue += quotation.grandTotals.totalGeneral;
      }
    });

    // Actualizar cada cliente con sus estadísticas
    const batch = writeBatch(db);
    let updatedCount = 0;

    for (const [clientId, stats] of Object.entries(clientStats)) {
      const clientRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/clients`,
        clientId
      );

      batch.update(clientRef, {
        quotationCount: stats.quotationCount,
        lastQuotationDate: stats.lastQuotationDate,
        totalRevenue: stats.totalRevenue,
      });

      updatedCount++;
    }

    await batch.commit();

    console.log(`✅ Estadísticas de clientes recalculadas:`);
    console.log(`   - Clientes actualizados: ${updatedCount}`);

    return { success: true, updatedCount };
  } catch (error) {
    console.error('❌ Error recalculando estadísticas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Ejecuta todas las migraciones en orden
 */
export const runAllMigrations = async (db, appId, userId) => {
  console.log('🚀 Iniciando proceso completo de migración...');
  console.log(`   - App ID: ${appId}`);
  console.log(`   - User ID: ${userId}`);
  console.log('');

  const results = {
    quotations: null,
    clients: null,
    clientStats: null,
  };

  // 1. Migrar quotations
  results.quotations = await migrateQuotations(db, appId, userId);
  console.log('');

  // 2. Migrar clients
  results.clients = await migrateClients(db, appId, userId);
  console.log('');

  // 3. Recalcular estadísticas de clientes
  results.clientStats = await recalculateClientStats(db, appId, userId);
  console.log('');

  // Resumen final
  console.log('📊 RESUMEN DE MIGRACIÓN:');
  console.log('========================');
  console.log(`Quotations: ${results.quotations.success ? '✅' : '❌'} (${results.quotations.migratedCount || 0} migradas)`);
  console.log(`Clients: ${results.clients.success ? '✅' : '❌'} (${results.clients.migratedCount || 0} migrados)`);
  console.log(`Client Stats: ${results.clientStats.success ? '✅' : '❌'} (${results.clientStats.updatedCount || 0} actualizados)`);
  console.log('========================');

  const allSuccess = results.quotations.success && results.clients.success && results.clientStats.success;

  if (allSuccess) {
    console.log('🎉 ¡Migración completada exitosamente!');
  } else {
    console.log('⚠️ Migración completada con errores. Revisa los logs arriba.');
  }

  return results;
};

/**
 * Verificar el estado de la migración sin ejecutarla
 */
export const checkMigrationStatus = async (db, appId, userId) => {
  console.log('🔍 Verificando estado de migración...');

  try {
    // Verificar quotations
    const quotationsRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/quotations`
    );
    const quotationsSnapshot = await getDocs(quotationsRef);

    let quotationsWithNewFields = 0;
    let quotationsTotal = quotationsSnapshot.size;

    quotationsSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.hasOwnProperty('isTemplate')) {
        quotationsWithNewFields++;
      }
    });

    // Verificar clients
    const clientsRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/clients`
    );
    const clientsSnapshot = await getDocs(clientsRef);

    let clientsWithNewFields = 0;
    let clientsTotal = clientsSnapshot.size;

    clientsSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.hasOwnProperty('quotationCount')) {
        clientsWithNewFields++;
      }
    });

    console.log('');
    console.log('📊 ESTADO DE MIGRACIÓN:');
    console.log('========================');
    console.log(`Quotations: ${quotationsWithNewFields}/${quotationsTotal} migradas (${((quotationsWithNewFields/quotationsTotal)*100).toFixed(1)}%)`);
    console.log(`Clients: ${clientsWithNewFields}/${clientsTotal} migrados (${((clientsWithNewFields/clientsTotal)*100).toFixed(1)}%)`);
    console.log('========================');

    const needsMigration = quotationsWithNewFields < quotationsTotal || clientsWithNewFields < clientsTotal;

    if (needsMigration) {
      console.log('⚠️ Se requiere migración. Ejecuta runAllMigrations()');
    } else {
      console.log('✅ Todos los documentos están migrados');
    }

    return {
      quotations: { migrated: quotationsWithNewFields, total: quotationsTotal },
      clients: { migrated: clientsWithNewFields, total: clientsTotal },
      needsMigration,
    };
  } catch (error) {
    console.error('❌ Error verificando migración:', error);
    return { error: error.message };
  }
};

/**
 * Migrar papeles de nombres dinámicos a tipos fijos (enum)
 * Convierte el sistema actual de papeles a opciones predefinidas
 */
export const migratePapersToFixedTypes = async (db, appId, userId) => {
  try {
    console.log('🔄 Iniciando migración de papeles a tipos fijos...');

    const profilesRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/priceProfiles`
    );
    const profilesSnapshot = await getDocs(profilesRef);

    let totalPapersMigrated = 0;
    let totalPapersDeleted = 0;
    let profilesProcessed = 0;
    const migrationLog = [];

    for (const profileDoc of profilesSnapshot.docs) {
      const profileId = profileDoc.id;
      const papersRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/priceProfiles/${profileId}/papers`
      );

      const papersSnapshot = await getDocs(papersRef);
      const papersMapped = new Map(); // tipo → {price, oldIds[]}

      console.log(`\n📁 Perfil: ${profileId}`);
      console.log(`   Papeles encontrados: ${papersSnapshot.size}`);

      // Paso 1: Mapear papeles existentes a tipos fijos
      papersSnapshot.forEach((paperDoc) => {
        const paperData = paperDoc.data();
        const paperName = (paperData.name || '').toLowerCase().trim();
        const paperId = paperDoc.id;

        // Intentar mapear a un tipo fijo
        let mappedType = null;

        if (paperName.includes('bond') && (paperName.includes('blanco') || paperName.includes('white'))) {
          mappedType = 'bond_blanco';
        } else if (paperName.includes('bond') && (paperName.includes('color') || paperName.includes('colores'))) {
          mappedType = 'bond_color';
        } else if (paperName.includes('couch') && paperName.includes('mate')) {
          mappedType = 'couche_mate';
        } else if (paperName.includes('couch') && (paperName.includes('brillante') || paperName.includes('brill'))) {
          mappedType = 'couche_brillante';
        } else if (paperName.includes('opalina')) {
          mappedType = 'opalina';
        } else if (paperName.includes('bristol') || paperName.includes('cartulina')) {
          mappedType = 'cartulina_bristol';
        } else {
          // Si no se puede mapear, usar bond_blanco por defecto
          mappedType = 'bond_blanco';
          console.warn(`   ⚠️ "${paperName}" no mapeado → bond_blanco (default)`);
        }

        // Agregar a mapping
        if (!papersMapped.has(mappedType)) {
          papersMapped.set(mappedType, {
            price: paperData.pricePerSheet || 0,
            oldIds: [],
            oldNames: []
          });
        }
        papersMapped.get(mappedType).oldIds.push(paperId);
        papersMapped.get(mappedType).oldNames.push(paperData.name);
      });

      // Paso 2: Crear documentos con IDs fijos y eliminar antiguos
      for (const [paperType, data] of papersMapped.entries()) {
        const paperOption = PAPER_TYPE_OPTIONS.find(p => p.value === paperType);

        if (!paperOption) {
          console.error(`   ❌ Tipo ${paperType} no existe en PAPER_TYPE_OPTIONS`);
          continue;
        }

        // Crear nuevo documento con ID fijo
        const newDocRef = doc(papersRef, paperType);
        await setDoc(newDocRef, {
          type: paperType,
          label: paperOption.label,
          defaultGramaje: paperOption.defaultGramaje,
          pricePerSheet: data.price,
          migratedFrom: data.oldNames, // Tracking
          migratedAt: new Date().toISOString(),
        });

        console.log(`   ✓ ${paperOption.label}: $${data.price.toFixed(2)}/pliego`);
        totalPapersMigrated++;

        // Eliminar documentos antiguos (solo si no es el mismo ID)
        for (const oldId of data.oldIds) {
          if (oldId !== paperType) {
            await deleteDoc(doc(papersRef, oldId));
            totalPapersDeleted++;
          }
        }
      }

      migrationLog.push({
        profileId,
        papersMigrated: papersMapped.size,
        papersDeleted: papersSnapshot.size - papersMapped.size,
      });

      profilesProcessed++;
    }

    console.log('\n✅ Migración de papeles completada');
    console.log(`   Perfiles procesados: ${profilesProcessed}`);
    console.log(`   Papeles migrados: ${totalPapersMigrated}`);
    console.log(`   Documentos antiguos eliminados: ${totalPapersDeleted}`);

    return {
      success: true,
      profilesProcessed,
      papersMigrated: totalPapersMigrated,
      papersDeleted: totalPapersDeleted,
      migrationLog,
    };
  } catch (error) {
    console.error('❌ Error en migración de papeles:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Actualizar items de quotations con nuevos IDs de papel
 * Mapea los IDs antiguos a los tipos fijos
 */
export const updateQuotationPaperIds = async (db, appId, userId) => {
  try {
    console.log('🔄 Actualizando IDs de papel en quotations...');

    const quotationsRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/quotations`
    );
    const quotationsSnapshot = await getDocs(quotationsRef);

    let quotationsUpdated = 0;
    let itemsUpdated = 0;

    // Primero, necesitamos construir un mapeo de oldId → newType
    // Para esto, leemos todos los papeles migrados de todos los perfiles
    const paperIdMapping = await buildPaperIdMapping(db, appId, userId);

    console.log(`   Mapeo de papeles construido: ${paperIdMapping.size} entradas`);

    const batch = writeBatch(db);
    let batchCount = 0;

    for (const quotDoc of quotationsSnapshot.docs) {
      const quotData = quotDoc.data();
      const items = quotData.items || [];
      let hasChanges = false;

      const updatedItems = items.map(item => {
        if (!item.selectedPaperTypeId) return item;

        const oldId = item.selectedPaperTypeId;
        const newType = paperIdMapping.get(oldId);

        if (newType && newType !== oldId) {
          itemsUpdated++;
          hasChanges = true;
          return {
            ...item,
            selectedPaperTypeId: newType,
          };
        }

        return item;
      });

      if (hasChanges) {
        const quotRef = doc(quotationsRef, quotDoc.id);
        batch.update(quotRef, { items: updatedItems });
        quotationsUpdated++;
        batchCount++;

        // Firestore batch limit is 500
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log('✅ IDs de papel actualizados en quotations');
    console.log(`   Quotations actualizadas: ${quotationsUpdated}`);
    console.log(`   Items actualizados: ${itemsUpdated}`);

    return {
      success: true,
      quotationsUpdated,
      itemsUpdated,
    };
  } catch (error) {
    console.error('❌ Error actualizando quotations:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Helper: Construir mapeo de IDs antiguos a tipos nuevos
 */
async function buildPaperIdMapping(db, appId, userId) {
  const mapping = new Map();

  const profilesRef = collection(
    db,
    `artifacts/${appId}/users/${userId}/priceProfiles`
  );
  const profilesSnapshot = await getDocs(profilesRef);

  for (const profileDoc of profilesSnapshot.docs) {
    const profileId = profileDoc.id;
    const papersRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/priceProfiles/${profileId}/papers`
    );

    const papersSnapshot = await getDocs(papersRef);

    papersSnapshot.forEach((paperDoc) => {
      const paperData = paperDoc.data();
      const newType = paperDoc.id; // El ID del documento ES el tipo
      const oldNames = paperData.migratedFrom || [];

      // Si tiene migratedFrom, mapear los IDs antiguos
      if (oldNames.length > 0 && paperData.type) {
        // Mapear el tipo actual al tipo nuevo
        mapping.set(newType, newType);
      }
    });
  }

  return mapping;
}
