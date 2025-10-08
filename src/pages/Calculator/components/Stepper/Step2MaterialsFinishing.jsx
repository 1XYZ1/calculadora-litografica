import React from "react";
import PaperMachineSelector from "../ItemFormPanel/PaperMachineSelector";
import FinishingOptions from "../ItemFormPanel/FinishingOptions";

/**
 * Paso 2: Materiales/Equipos + Acabados
 * Si es impresión digital, solo muestra acabados
 * Si es offset, muestra materiales y acabados
 */
const Step2MaterialsFinishing = ({
  currentItem,
  handleItemChange,
  paperTypes,
  plateSizes,
  machineTypes,
}) => {
  const isDigital = currentItem.printingAreaOption === "quarter_sheet_digital";

  // Verificar si hay algún acabado seleccionado
  const hasAnyFinishing =
    currentItem.isUVSelected ||
    currentItem.isLaminadoMateSelected ||
    currentItem.isLaminadoBrillanteSelected ||
    currentItem.isRemateSelected ||
    currentItem.isSignadoSelected ||
    currentItem.isTroqueladoSelected;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Materiales y Equipos (solo para offset) */}
      {!isDigital && (
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Materiales y Equipos
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Selecciona el papel, plancha y máquina para impresión offset
            </p>
          </div>

          <PaperMachineSelector
            currentItem={currentItem}
            handleItemChange={handleItemChange}
            paperTypes={paperTypes}
            plateSizes={plateSizes}
            machineTypes={machineTypes}
          />
        </div>
      )}

      {/* Acabados */}
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Acabados
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Agrega acabados especiales a tu trabajo (opcional)
          </p>
        </div>

        <FinishingOptions
          currentItem={currentItem}
          handleItemChange={handleItemChange}
        />

        {/* Indicador visual de acabados seleccionados */}
        {hasAnyFinishing && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <p className="text-sm sm:text-base font-semibold text-orange-800 mb-2">
              Acabados seleccionados:
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {currentItem.isUVSelected && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  UV{" "}
                  {currentItem.uvSizeOption && `(${currentItem.uvSizeOption})`}
                </span>
              )}
              {currentItem.isLaminadoMateSelected && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Laminado Mate
                  {currentItem.isLaminadoMateTiroRetiro && " (Ambas caras)"}
                </span>
              )}
              {currentItem.isLaminadoBrillanteSelected && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Laminado Brillante
                  {currentItem.isLaminadoBrillanteTiroRetiro &&
                    " (Ambas caras)"}
                </span>
              )}
              {currentItem.isRemateSelected && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Remate
                </span>
              )}
              {currentItem.isSignadoSelected && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Signado
                </span>
              )}
              {currentItem.isTroqueladoSelected && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Troquelado (${currentItem.troquelPrice || 0})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mensaje si no hay acabados */}
        {!hasAnyFinishing && (
          <div className="mt-4 sm:mt-6 bg-gray-50 border-2 border-dashed border-gray-300 p-4 sm:p-6 rounded-lg text-center">
            <p className="text-gray-500 text-sm sm:text-base">
              No has seleccionado ningún acabado.
              <br />
              Puedes continuar sin acabados o agregar algunos para mejorar el
              resultado final.
            </p>
          </div>
        )}
      </div>

      {/* Indicador de ayuda */}
      <div className="bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm sm:text-base text-green-700">
              <strong>Tip:</strong>{" "}
              {isDigital
                ? "En impresión digital, algunos acabados como Remate, Signado y Troquelado no están disponibles."
                : "El sistema selecciona automáticamente la plancha y máquina más adecuadas, pero puedes modificarlas si lo necesitas."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Step2MaterialsFinishing);
