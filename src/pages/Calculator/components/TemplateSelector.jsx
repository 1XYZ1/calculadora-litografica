/**
 * Modal selector de plantillas
 * Permite al usuario seleccionar una plantilla de cotización y cargarla en el Calculator
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotationTemplates } from '../../../hooks/useQuotationTemplates';
import { useClients } from '../../../context/ClientsContext';
import BaseModal from '../../../components/BaseModal';

export default function TemplateSelector({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { templates, loading } = useQuotationTemplates();
  const { clients } = useClients();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Obtener nombre del cliente
  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Cliente original';
  };

  // Manejar selección de plantilla
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  // Confirmar uso de plantilla
  const handleUseTemplate = () => {
    if (!selectedTemplate) return;

    // Navegar a Calculator con la plantilla cargada
    navigate('/calculator/edit', {
      state: {
        quotation: selectedTemplate,
        fromTemplate: true
      }
    });

    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="📑 Seleccionar Plantilla">
      <div className="max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando plantillas...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No hay plantillas disponibles aún.
            </p>
            <p className="text-sm text-gray-400">
              Puedes marcar una cotización como plantilla desde la sección de "Cotizaciones Guardadas".
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Las plantillas te permiten reutilizar cotizaciones frecuentes.
                Selecciona una para empezar una nueva cotización basada en ella.
              </p>
            </div>

            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {template.templateName || template.mainQuotationName}
                        </h4>
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                          ⭐ Plantilla
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Cliente original: {getClientName(template.clientId)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Usada</p>
                      <p className="text-lg font-bold text-purple-600">
                        {template.usageCount || 0}
                      </p>
                      <p className="text-xs text-gray-500">veces</p>
                    </div>
                  </div>

                  {/* Preview de ítems */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      📦 Ítems incluidos ({template.items?.length || 0}):
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {template.items?.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full text-gray-500">
                            {idx + 1}
                          </span>
                          <span className="flex-1">
                            {item.itemName || `Ítem ${idx + 1}`}
                          </span>
                          <span className="text-gray-400">
                            {item.finishedPieces || 0} pzas
                          </span>
                        </div>
                      ))}
                      {template.items?.length > 5 && (
                        <p className="text-xs text-gray-400 italic pl-7">
                          ... y {template.items.length - 5} más
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Totales */}
                  {template.grandTotals && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total original:</span>
                        <span className="font-semibold text-green-700">
                          Bs {template.grandTotals.finalTotalBs?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleUseTemplate}
          disabled={!selectedTemplate}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTemplate
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Usar Plantilla
        </button>
      </div>
    </BaseModal>
  );
}
