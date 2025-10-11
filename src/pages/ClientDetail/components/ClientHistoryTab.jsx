import React from "react";

/**
 * Tab de historial de actividad del cliente
 * Muestra una línea de tiempo de eventos importantes
 */
function ClientHistoryTab({ client, quotations }) {
  // Generar eventos del historial combinando datos del cliente y cotizaciones
  const generateHistory = () => {
    const events = [];

    // Evento de creación del cliente
    if (client?.createdAt) {
      events.push({
        id: `created-${client.createdAt}`,
        type: "client_created",
        date: client.createdAt,
        title: "Cliente creado",
        description: "Se registró el cliente en el sistema",
        icon: "user",
        color: "blue",
      });
    }

    // Eventos de cotizaciones
    if (quotations && quotations.length > 0) {
      quotations.forEach((quotation) => {
        // Evento de creación de cotización
        if (quotation.createdAt) {
          events.push({
            id: `quotation-${quotation.id}`,
            type: "quotation_created",
            date: quotation.createdAt,
            title: "Cotización creada",
            description: quotation.quotationName || "Sin nombre",
            icon: "document",
            color: "green",
            quotationId: quotation.id,
          });
        }

        // Evento de aprobación
        if (quotation.status === "approved" && quotation.updatedAt) {
          events.push({
            id: `approved-${quotation.id}`,
            type: "quotation_approved",
            date: quotation.updatedAt,
            title: "Cotización aprobada",
            description: quotation.quotationName || "Sin nombre",
            icon: "check",
            color: "green",
            quotationId: quotation.id,
          });
        }
      });
    }

    // Evento de cambio de perfil (si existe)
    if (client?.updatedAt && client?.priceProfileId) {
      events.push({
        id: `profile-${client.updatedAt}`,
        type: "profile_changed",
        date: client.updatedAt,
        title: "Perfil de precios actualizado",
        description: "Se cambió el perfil de precios del cliente",
        icon: "settings",
        color: "purple",
      });
    }

    // Ordenar por fecha descendente
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const history = generateHistory();

  const getIcon = (iconName) => {
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
      check: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      settings: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
      ),
    };

    return icons[iconName] || icons.document;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-100",
        border: "border-blue-500",
        icon: "text-blue-600",
        iconBg: "bg-blue-500",
      },
      green: {
        bg: "bg-green-100",
        border: "border-green-500",
        icon: "text-green-600",
        iconBg: "bg-green-500",
      },
      purple: {
        bg: "bg-purple-100",
        border: "border-purple-500",
        icon: "text-purple-600",
        iconBg: "bg-purple-500",
      },
      gray: {
        bg: "bg-gray-100",
        border: "border-gray-500",
        icon: "text-gray-600",
        iconBg: "bg-gray-500",
      },
    };

    return colors[color] || colors.gray;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha desconocida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (history.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          Sin historial
        </h4>
        <p className="text-gray-600">
          No hay eventos registrados para este cliente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">
            Historial de Actividad
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Línea de tiempo de todos los eventos importantes
          </p>
        </div>

        <div className="p-6">
          {/* Línea de tiempo */}
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Eventos */}
            <div className="space-y-6">
              {history.map((event, index) => {
                const colors = getColorClasses(event.color);
                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icono del evento */}
                    <div
                      className={`relative z-10 flex-shrink-0 w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {getIcon(event.icon)}
                      </svg>
                    </div>

                    {/* Contenido del evento */}
                    <div
                      className={`flex-1 ${colors.bg} border-2 ${colors.border} rounded-lg p-4 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-800">
                          {event.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {event.description}
                      </p>
                      {event.quotationId && (
                        <a
                          href={`/calculator?quotationId=${event.quotationId}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2"
                        >
                          Ver cotización
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
        <h4 className="font-bold text-gray-800 mb-4">Resumen de Actividad</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {history.filter((e) => e.type === "quotation_created").length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Cotizaciones creadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {history.filter((e) => e.type === "quotation_approved").length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Cotizaciones aprobadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {history.filter((e) => e.type === "profile_changed").length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Cambios de perfil</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{history.length}</p>
            <p className="text-xs text-gray-600 mt-1">Eventos totales</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientHistoryTab;
