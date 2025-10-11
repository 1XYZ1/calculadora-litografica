/**
 * Pantalla de inicio mejorada del Calculator
 * Punto de entrada unificado para todos los flujos de trabajo
 * Implementa Iteración 4 del roadmap
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/FirebaseContext';
import { usePriceProfilesList } from '../../PriceProfiles/hooks/usePriceProfilesList';
import { useClientsCRUD } from '../../Clients/hooks/useClientsCRUD';
import ClientFormModal from '../../../components/ClientFormModal';
import TemplateSelector from './TemplateSelector';
import RecentQuotations from './RecentQuotations';

export default function CalculatorHome() {
  const navigate = useNavigate();
  const { userId } = useFirebase();
  const { profiles: priceProfiles } = usePriceProfilesList();
  const { createClient } = useClientsCRUD();

  const [showClientModal, setShowClientModal] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  // Manejar flujo "Nueva Cotización" - navegar a /calculator/config
  const handleNewQuotation = () => {
    navigate('/calculator/config');
  };

  // Manejar flujo "Cliente Nuevo"
  const handleNewClient = () => {
    setShowClientModal(true);
  };

  // Manejar flujo "Desde Plantilla"
  const handleFromTemplate = () => {
    setShowTemplateSelector(true);
  };

  // Cuando se crea un cliente exitosamente
  const handleClientCreated = async (formData) => {
    setCreatingClient(true);
    try {
      const newClient = await createClient(formData);
      setShowClientModal(false);

      // Navegar a /calculator/config con el cliente pre-seleccionado
      navigate('/calculator/config', {
        state: { preselectedClientId: newClient.id }
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
    } finally {
      setCreatingClient(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🧮 Calculadora de Cotizaciones
          </h1>
          <p className="text-lg text-gray-600">
            ¿Qué deseas hacer hoy?
          </p>
        </div>

        {/* Botones principales de acción */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Botón 1: Nueva Cotización */}
          <button
            onClick={handleNewQuotation}
            className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl group-hover:bg-blue-200 transition-colors">
                📋
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Nueva Cotización
                </h3>
                <p className="text-sm text-gray-600">
                  Crear cotización desde cero seleccionando un cliente existente
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-blue-600 text-2xl">→</span>
              </div>
            </div>
          </button>

          {/* Botón 2: Cliente Nuevo */}
          <button
            onClick={handleNewClient}
            className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl group-hover:bg-green-200 transition-colors">
                👤
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Cliente Nuevo
                </h3>
                <p className="text-sm text-gray-600">
                  Crear un nuevo cliente e iniciar cotización automáticamente
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-green-600 text-2xl">→</span>
              </div>
            </div>
          </button>

          {/* Botón 3: Desde Plantilla */}
          <button
            onClick={handleFromTemplate}
            className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-4xl group-hover:bg-purple-200 transition-colors">
                📑
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Desde Plantilla
                </h3>
                <p className="text-sm text-gray-600">
                  Usar una plantilla predefinida para agilizar el trabajo
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-purple-600 text-2xl">→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Accesos rápidos adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => navigate('/clients')}
            className="flex items-center gap-4 p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
              📇
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-gray-900">Gestionar Clientes</h4>
              <p className="text-sm text-gray-600">Ver y administrar todos los clientes</p>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => navigate('/quotations')}
            className="flex items-center gap-4 p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
              📁
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-gray-900">Cotizaciones Guardadas</h4>
              <p className="text-sm text-gray-600">Ver historial completo de cotizaciones</p>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>

        {/* Sección de cotizaciones recientes */}
        <RecentQuotations />

        {/* Tips y ayuda */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            💡 Consejos para trabajar más rápido
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Usa <strong>plantillas</strong> para cotizaciones repetitivas como tarjetas o volantes estándar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Duplica cotizaciones existentes cuando un cliente pide algo similar a pedidos anteriores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Crea el cliente directamente desde aquí para empezar a cotizar inmediatamente</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Modales */}
      <ClientFormModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSubmit={handleClientCreated}
        priceProfiles={priceProfiles}
        mode="create"
      />

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
      />
    </div>
  );
}
