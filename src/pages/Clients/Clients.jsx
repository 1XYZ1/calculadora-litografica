import React, { useState, useCallback } from "react";
import ModalMessage from "../../components/ModalMessage";
import ConfirmationModal from "../../components/ConfirmationModal";

// Hooks
import { useClientsData } from "./hooks/useClientsData";
import { useClientsCRUD } from "./hooks/useClientsCRUD";
import { usePriceProfilesList } from "../PriceProfiles/hooks/usePriceProfilesList";

// Componentes
import ClientsHeader from "./components/ClientsHeader";
import ClientFormModal from "./components/ClientFormModal";
import ClientsList from "./components/ClientsList";

/**
 * Componente principal de la página de Clientes
 * Permite gestionar clientes y asignarles perfiles de precios
 */
function Clients() {
  // Estados para modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState("create");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [notification, setNotification] = useState("");

  // Hook de clientes
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
  } = useClientsData();

  // Hook de perfiles de precios (necesario para el selector)
  const { profiles, loading: profilesLoading } = usePriceProfilesList();

  // Hook de operaciones CRUD
  const clientsCRUD = useClientsCRUD();

  // Handler para mostrar notificación
  const showNotification = useCallback((message) => {
    setNotification(message);
  }, []);

  // Handler para cerrar notificación
  const closeNotification = useCallback(() => {
    setNotification("");
  }, []);

  // Handler para abrir modal de creación
  const handleCreateClient = useCallback(() => {
    if (profiles.length === 0) {
      showNotification(
        "Debes crear al menos un perfil de precios antes de agregar clientes"
      );
      return;
    }
    setFormModalMode("create");
    setCurrentClient(null);
    setFormModalOpen(true);
  }, [profiles, showNotification]);

  // Handler para abrir modal de edición
  const handleEditClient = useCallback((client) => {
    setFormModalMode("edit");
    setCurrentClient(client);
    setFormModalOpen(true);
  }, []);

  // Handler para abrir modal de confirmación de eliminación
  const handleDeleteClient = useCallback((client) => {
    setCurrentClient(client);
    setDeleteModalOpen(true);
  }, []);

  // Handler para confirmar eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (!currentClient) return;

    try {
      await clientsCRUD.deleteClient(currentClient.id);
      showNotification("Cliente eliminado exitosamente");
      setDeleteModalOpen(false);
      setCurrentClient(null);
    } catch (error) {
      showNotification(error.message || "Error al eliminar el cliente");
      setDeleteModalOpen(false);
    }
  }, [currentClient, clientsCRUD, showNotification]);

  // Handler para submit del formulario
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        let result;

        if (formModalMode === "create") {
          result = await clientsCRUD.createClient(formData);
        } else if (formModalMode === "edit") {
          result = await clientsCRUD.updateClient(currentClient.id, formData);
        }

        showNotification(result.message);
        setFormModalOpen(false);
        setCurrentClient(null);
      } catch (error) {
        showNotification(error.message || "Error al procesar el cliente");
      }
    },
    [formModalMode, currentClient, clientsCRUD, showNotification]
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Modal de mensajes */}
      <ModalMessage message={notification} onClose={closeNotification} />

      {/* Modal de formulario */}
      <ClientFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        mode={formModalMode}
        currentClient={currentClient}
        priceProfiles={profiles}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar el cliente "${currentClient?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header con botón de crear */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <ClientsHeader />
          <button
            onClick={handleCreateClient}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2 mt-4 md:mt-0"
            disabled={profilesLoading}
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nuevo Cliente
          </button>
        </div>

        {/* Mensaje de advertencia si no hay perfiles */}
        {!profilesLoading && profiles.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 flex-shrink-0 mt-0.5"
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
              <div>
                <p className="font-semibold mb-1">
                  No hay perfiles de precios creados
                </p>
                <p className="text-sm">
                  Antes de crear clientes, necesitas crear al menos un perfil de
                  precios en la sección de Configuración.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error de carga */}
        {clientsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {clientsError}
          </div>
        )}

        {/* Loading state */}
        {clientsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          /* Lista de clientes */
          <ClientsList
            clients={clients}
            priceProfiles={profiles}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
          />
        )}
      </div>
    </div>
  );
}

export default Clients;
