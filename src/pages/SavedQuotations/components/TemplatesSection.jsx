import React from "react";
import QuotationCard from "./QuotationCard";

/**
 * Sección dedicada para mostrar plantillas de cotizaciones
 * Filtradas y ordenadas por usageCount
 */
const TemplatesSection = ({
  templates,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
  onShare,
  onToggleTemplate,
  onUpdateTemplateName,
  onUseTemplate,
  currency = "USD",
  showBolivars,
}) => {
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {/* Header de la sección */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <TemplateIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Plantillas de Cotizaciones
            </h2>
            <p className="text-sm text-gray-600">
              {templates.length} {templates.length === 1 ? "plantilla disponible" : "plantillas disponibles"}
            </p>
          </div>
        </div>

        <InfoButton />
      </div>

      {/* Lista de plantillas */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
        <ul className="space-y-3">
          {templates.map((template) => (
            <QuotationCard
              key={template.id}
              quotation={template}
              onEdit={onEdit}
              onDelete={onDelete}
              onPreview={onPreview}
              onDuplicate={onDuplicate}
              onShare={onShare}
              onToggleTemplate={onToggleTemplate}
              onUpdateTemplateName={onUpdateTemplateName}
              currency={currency}
              showBolivars={showBolivars}
            />
          ))}
        </ul>

        {/* Mensaje informativo */}
        {templates.length > 0 && (
          <div className="mt-4 p-3 bg-white bg-opacity-70 rounded-lg border border-amber-300">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-amber-600 text-lg">💡</span>
              <div className="text-gray-700">
                <strong>Tip:</strong> Usa las plantillas para crear cotizaciones similares en segundos.
                Click en "Duplicar" para crear una nueva cotización basada en la plantilla.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ---------- Subcomponentes ---------- */

const InfoButton = () => {
  const [showInfo, setShowInfo] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Información sobre plantillas"
      >
        <InfoIcon />
      </button>

      {showInfo && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowInfo(false)}
          />

          {/* Popup de información */}
          <div className="absolute right-0 top-12 z-20 w-80 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              ¿Qué son las plantillas?
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                Las plantillas son cotizaciones que has marcado como reutilizables.
              </p>
              <p>
                <strong>Beneficios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Ahorra tiempo en cotizaciones repetitivas</li>
                <li>Mantiene consistencia en precios</li>
                <li>Rastrea cuántas veces usas cada plantilla</li>
              </ul>
              <p className="mt-3">
                <strong>Cómo usar:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click en "Duplicar" en cualquier plantilla</li>
                <li>Selecciona el cliente</li>
                <li>Ajusta lo necesario y guarda</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* Iconos */
const TemplateIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const InfoIcon = () => (
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
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default React.memo(TemplatesSection);
