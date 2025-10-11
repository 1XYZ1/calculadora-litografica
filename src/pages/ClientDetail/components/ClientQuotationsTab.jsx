import React from "react";
import { useNavigate } from "react-router-dom";
import { QUOTATION_STATUS } from "../../../utils/constants";

/**
 * Tab de cotizaciones del cliente
 * Muestra todas las cotizaciones asociadas al cliente
 */
function ClientQuotationsTab({ clientId, quotations, loading }) {
  const navigate = useNavigate();

  const handleNewQuotation = () => {
    // Navegar a Calculator con el cliente preseleccionado
    navigate(`/calculator?clientId=${clientId}`);
  };

  const handleOpenQuotation = (quotationId) => {
    // Navegar a la cotización en Calculator en modo edición
    navigate(`/calculator?quotationId=${quotationId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [QUOTATION_STATUS.DRAFT]: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "Borrador",
      },
      [QUOTATION_STATUS.PENDING]: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Pendiente",
      },
      [QUOTATION_STATUS.APPROVED]: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Aprobada",
      },
      [QUOTATION_STATUS.REJECTED]: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Rechazada",
      },
    };

    const config = statusConfig[status] || statusConfig[QUOTATION_STATUS.DRAFT];

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateTotal = (quotation) => {
    if (!quotation.items || quotation.items.length === 0) return 0;
    return quotation.items.reduce(
      (sum, item) => sum + (item.totalPriceBs || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de nueva cotización */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Cotizaciones del Cliente
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {quotations.length}{" "}
            {quotations.length === 1 ? "cotización" : "cotizaciones"} en total
          </p>
        </div>
        <button
          onClick={handleNewQuotation}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
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

      {/* Lista de cotizaciones */}
      {quotations.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            No hay cotizaciones
          </h4>
          <p className="text-gray-600 mb-6">
            Este cliente aún no tiene cotizaciones. Crea la primera ahora.
          </p>
          <button
            onClick={handleNewQuotation}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-flex items-center gap-2"
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
            Crear Primera Cotización
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {quotations.map((quotation) => (
            <div
              key={quotation.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-indigo-300 cursor-pointer"
              onClick={() => handleOpenQuotation(quotation.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-800">
                      {quotation.quotationName || "Sin nombre"}
                    </h4>
                    {getStatusBadge(quotation.status)}
                    {quotation.isTemplate && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Plantilla
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(quotation.updatedAt || quotation.createdAt)}
                    </span>
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {quotation.items?.length || 0}{" "}
                      {quotation.items?.length === 1 ? "ítem" : "ítems"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">
                    Bs. {calculateTotal(quotation).toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total</p>
                </div>
              </div>

              {/* Items preview */}
              {quotation.items && quotation.items.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Productos:</p>
                  <div className="flex flex-wrap gap-2">
                    {quotation.items.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {item.productName || `Producto ${idx + 1}`}
                      </span>
                    ))}
                    {quotation.items.length > 3 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                        +{quotation.items.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientQuotationsTab;
