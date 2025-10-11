/**
 * Modal selector de plantillas - UI simplificada con versión móvil
 * Permite al usuario seleccionar una plantilla de cotización y cargarla en el Calculator
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotationTemplates } from '../../../hooks/useQuotationTemplates';
import BaseModal from '../../../components/BaseModal';

export default function TemplateSelector({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { templates, loading } = useQuotationTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Confirmar uso de plantilla
  const handleUseTemplate = () => {
    if (!selectedTemplate) return;

    // Navegar a la pantalla de configuración con la plantilla
    navigate('/calculator/config', {
      state: {
        templateData: selectedTemplate,
        mode: 'from-template'
      }
    });

    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="default">
      <div className="p-5 sm:p-6 md:p-8">
        {/* Header del modal */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Seleccionar Plantilla
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="max-h-[60vh] sm:max-h-[500px] overflow-y-auto -mx-5 sm:-mx-6 md:-mx-8 px-5 sm:px-6 md:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm sm:text-base">Cargando plantillas...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl sm:text-4xl">📋</span>
              </div>
              <p className="text-gray-600 font-medium mb-2 text-center">
                No hay plantillas disponibles
              </p>
              <p className="text-xs sm:text-sm text-gray-400 text-center max-w-sm">
                Marca una cotización como plantilla desde "Cotizaciones Guardadas" para reutilizarla
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`group relative rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  {/* Versión Desktop */}
                  <div className="hidden sm:block p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg truncate mb-1">
                          {template.templateName || template.mainQuotationName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            📦 {template.items?.length || 0} {template.items?.length === 1 ? 'ítem' : 'ítems'}
                          </span>
                          {template.usageCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                ✓ Usada {template.usageCount} {template.usageCount === 1 ? 'vez' : 'veces'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Radio indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {selectedTemplate?.id === template.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Preview compacto - solo primeros 2 ítems */}
                    {template.items && template.items.length > 0 && (
                      <div className="space-y-1.5">
                        {template.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded">
                            <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                            <span className="flex-1 truncate font-medium">
                              {item.itemName || `Ítem ${idx + 1}`}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {item.finishedPieces || 0} pzas
                            </span>
                          </div>
                        ))}
                        {template.items.length > 2 && (
                          <div className="text-xs text-gray-400 text-center py-1">
                            + {template.items.length - 2} ítems más
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Versión Mobile - Simplificada */}
                  <div className="block sm:hidden p-3">
                    <div className="flex items-center gap-3">
                      {/* Radio indicator mobile */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedTemplate?.id === template.id && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base mb-0.5 line-clamp-1">
                          {template.templateName || template.mainQuotationName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span>📦 {template.items?.length || 0}</span>
                          {template.usageCount > 0 && (
                            <>
                              <span>•</span>
                              <span>✓ {template.usageCount}x</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con botones */}
        {templates.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={handleUseTemplate}
              disabled={!selectedTemplate}
              className={`w-full sm:flex-1 px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${
                selectedTemplate
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">
                {selectedTemplate ? 'Usar esta plantilla' : 'Selecciona una plantilla'}
              </span>
              <span className="inline sm:hidden">
                {selectedTemplate ? 'Usar plantilla' : 'Selecciona'}
              </span>
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
