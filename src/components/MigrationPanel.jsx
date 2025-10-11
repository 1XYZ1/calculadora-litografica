import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import {
  checkMigrationStatus,
  runAllMigrations,
} from '../utils/migrateFirestoreData';

/**
 * Componente temporal para ejecutar la migración de datos de Firestore
 * IMPORTANTE: Este componente debe ser eliminado después de ejecutar la migración
 *
 * Uso: Agregar temporalmente en PriceProfiles o en una página de admin
 */
export default function MigrationPanel() {
  const { db, appId, userId } = useFirebase();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [migrationResults, setMigrationResults] = useState(null);

  const handleCheckStatus = async () => {
    setLoading(true);
    setStatus('Verificando estado de migración...');

    try {
      const result = await checkMigrationStatus(db, appId, userId);
      setStatus(null);

      // Mostrar resultados en formato legible
      const statusText = `
Estado de Migración:
- Quotations: ${result.quotations.migrated}/${result.quotations.total} migradas
- Clients: ${result.clients.migrated}/${result.clients.total} migrados
${result.needsMigration ? '⚠️ Se requiere migración' : '✅ Migración completada'}
      `;

      alert(statusText);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMigration = async () => {
    const confirmed = window.confirm(
      '⚠️ ¿Estás seguro de ejecutar la migración?\n\n' +
      'Esto actualizará todos los documentos en Firestore.\n' +
      'La operación es segura y no eliminará datos existentes.'
    );

    if (!confirmed) return;

    setLoading(true);
    setStatus('Ejecutando migración... Esto puede tomar un momento.');

    try {
      const results = await runAllMigrations(db, appId, userId);
      setMigrationResults(results);
      setStatus(null);

      // Mostrar resumen
      const successCount = [
        results.quotations.success,
        results.clients.success,
        results.clientStats.success,
      ].filter(Boolean).length;

      const summary = `
✅ Migración Completada

Resultados:
- Quotations: ${results.quotations.success ? '✅' : '❌'} (${results.quotations.migratedCount || 0} migradas)
- Clients: ${results.clients.success ? '✅' : '❌'} (${results.clients.migratedCount || 0} migrados)
- Client Stats: ${results.clientStats.success ? '✅' : '❌'} (${results.clientStats.updatedCount || 0} actualizados)

${successCount === 3 ? '🎉 ¡Todo completado exitosamente!' : '⚠️ Algunas operaciones tuvieron errores'}
      `;

      alert(summary);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      alert(`❌ Error en la migración: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-400 rounded-full p-2">
            <svg
              className="w-6 h-6 text-yellow-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              🔧 Panel de Migración de Datos
            </h3>
            <p className="text-sm text-gray-600">
              Iteración 1 - Actualización de Schemas de Firestore
            </p>
          </div>
        </div>
        <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
          DESARROLLO
        </span>
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
        <p className="text-sm text-gray-700 mb-2">
          <strong>¿Qué hace esta migración?</strong>
        </p>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Agrega campos de plantillas a cotizaciones (isTemplate, templateName, etc.)</li>
          <li>Agrega estadísticas a clientes (quotationCount, lastQuotationDate, totalRevenue)</li>
          <li>Recalcula automáticamente las estadísticas basándose en datos existentes</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          ⚠️ <strong>Importante:</strong> Esta operación es segura y no elimina datos. Puede ejecutarse múltiples veces.
        </p>
      </div>

      {/* Estado actual */}
      {status && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium">{status}</span>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCheckStatus}
          disabled={loading}
          className="flex-1 btn-primary bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium shadow-md hover:shadow-lg transition-all"
        >
          <span className="flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span>Verificar Estado</span>
          </span>
        </button>

        <button
          onClick={handleRunMigration}
          disabled={loading}
          className="flex-1 btn-primary bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium shadow-md hover:shadow-lg transition-all"
        >
          <span className="flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Ejecutar Migración</span>
          </span>
        </button>
      </div>

      {/* Resultados detallados */}
      {migrationResults && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
          <h4 className="font-bold text-gray-800 mb-2">📊 Resultados Detallados:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Quotations:</span>
              <span className={migrationResults.quotations.success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {migrationResults.quotations.success ? '✅' : '❌'}
                {' '}({migrationResults.quotations.migratedCount || 0} migradas)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Clients:</span>
              <span className={migrationResults.clients.success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {migrationResults.clients.success ? '✅' : '❌'}
                {' '}({migrationResults.clients.migratedCount || 0} migrados)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Client Stats:</span>
              <span className={migrationResults.clientStats.success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {migrationResults.clientStats.success ? '✅' : '❌'}
                {' '}({migrationResults.clientStats.updatedCount || 0} actualizados)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-yellow-200">
        <p className="text-xs text-gray-500 text-center">
          💡 <strong>Tip:</strong> Verifica primero el estado antes de ejecutar la migración.
          Después de completar, puedes eliminar este componente del código.
        </p>
      </div>
    </div>
  );
}
