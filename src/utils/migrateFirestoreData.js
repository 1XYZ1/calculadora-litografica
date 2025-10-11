/**
 * Script de migración para actualizar schemas de Firestore
 * Agrega nuevos campos a las colecciones existentes sin afectar datos actuales
 *
 * Ejecutar desde la consola del navegador o como función standalone
 */

import { collection, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';

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
