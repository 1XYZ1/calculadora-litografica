import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useClientDetail } from "./hooks/useClientDetail";
import { useClientQuotations } from "./hooks/useClientQuotations";
import Toast from "../../components/Toast";

// Tabs
import ClientInfoTab from "./components/ClientInfoTab";
import ClientQuotationsTab from "./components/ClientQuotationsTab";
import ClientPriceProfileTab from "./components/ClientPriceProfileTab";
import ClientHistoryTab from "./components/ClientHistoryTab";

/**
 * Página de detalle del cliente
 * Vista unificada con toda la información y acciones del cliente
 */
function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [toast, setToast] = useState(null);

  // Hooks de datos
  const { client, loading, error, saving, updateClient } =
    useClientDetail(clientId);
  const {
    quotations,
    loading: quotationsLoading,
    error: quotationsError,
  } = useClientQuotations(clientId);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveClient = async (updates) => {
    const result = await updateClient(updates);
    if (result.success) {
      showToast("Cliente actualizado correctamente", "success");
    } else {
      showToast(result.error || "Error al actualizar cliente", "error");
    }
    return result;
  };

  const handleUpdateProfile = async (updates) => {
    const result = await updateClient(updates);
    if (result.success) {
      showToast("Perfil de precios actualizado", "success");
    } else {
      showToast(result.error || "Error al actualizar perfil", "error");
    }
    return result;
  };

  const tabs = [
    { id: "info", label: "Información", icon: "user" },
    { id: "quotations", label: "Cotizaciones", icon: "document" },
    { id: "profile", label: "Perfil de Precios", icon: "tag" },
    { id: "history", label: "Historial", icon: "clock" },
  ];

  const getTabIcon = (iconName) => {
    const icons = {
      user: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
      document: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      ),
      tag: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      ),
      clock: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    };
    return icons[iconName] || icons.user;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">
            El cliente que buscas no existe o ha sido eliminado.
          </p>
          <button
            onClick={() => navigate("/clients")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Volver a Clientes
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4 text-indigo-100">
            <Link
              to="/clients"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Clientes
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{client.name}</span>
          </nav>

          {/* Título y acciones */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {client.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-100">
                {client.email && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {client.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Botón nueva cotización */}
            <button
              onClick={() => navigate(`/calculator?clientId=${clientId}`)}
              className="ml-4 px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium flex items-center gap-2 shadow-lg"
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
              Nueva Cotización
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 border-b border-indigo-400">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-white border-b-2 border-white bg-indigo-700/30"
                    : "text-indigo-200 hover:text-white hover:bg-indigo-700/20"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {getTabIcon(tab.icon)}
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido del tab activo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === "info" && (
          <ClientInfoTab
            client={client}
            onSave={handleSaveClient}
            saving={saving}
          />
        )}
        {activeTab === "quotations" && (
          <ClientQuotationsTab
            clientId={clientId}
            quotations={quotations}
            loading={quotationsLoading}
          />
        )}
        {activeTab === "profile" && (
          <ClientPriceProfileTab
            client={client}
            onUpdateProfile={handleUpdateProfile}
            saving={saving}
          />
        )}
        {activeTab === "history" && (
          <ClientHistoryTab client={client} quotations={quotations} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default ClientDetail;
