/**
 * Componente que muestra las cotizaciones recientes del usuario
 * Permite acceso rápido a cotizaciones previas desde la pantalla de inicio
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentQuotations } from '../hooks/useRecentQuotations';
import { useClients } from '../../../context/ClientsContext';

export default function RecentQuotations() {
  const navigate = useNavigate();
  const { quotations, loading, error } = useRecentQuotations(5);
  const { clients } = useClients();

  // Función para obtener nombre del cliente
  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Cliente desconocido';
  };

  // Función para formatear fecha de manera amigable
  const formatRelativeDate = (timestamp) => {
    if (!timestamp?.toDate) return '';

    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

    // Formato de fecha estándar
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Manejar clic en cotización para abrirla
  const handleOpenQuotation = (quotation) => {
    navigate('/calculator/edit', {
      state: { quotation }
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Cotizaciones Recientes
        </h3>
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Cotizaciones Recientes
        </h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Cotizaciones Recientes
        </h3>
        <p className="text-gray-500 italic">
          No hay cotizaciones guardadas aún. ¡Crea tu primera cotización!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📋 Cotizaciones Recientes
        </h3>
        <button
          onClick={() => navigate('/quotations')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver todas →
        </button>
      </div>

      <div className="space-y-3">
        {quotations.map((quotation) => (
          <div
            key={quotation.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
            onClick={() => handleOpenQuotation(quotation)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">
                  {quotation.mainQuotationName || 'Sin nombre'}
                </h4>
                {quotation.isTemplate && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    ⭐ Plantilla
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>👤 {getClientName(quotation.clientId)}</span>
                <span>•</span>
                <span>{quotation.items?.length || 0} ítems</span>
                <span>•</span>
                <span>{formatRelativeDate(quotation.timestamp)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {quotation.grandTotals?.finalTotalBs && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-green-700">
                    Bs {quotation.grandTotals.finalTotalBs.toFixed(2)}
                  </p>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenQuotation(quotation);
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Abrir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
