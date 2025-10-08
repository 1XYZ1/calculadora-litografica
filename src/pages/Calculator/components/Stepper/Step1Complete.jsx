import React from "react";
import ItemBasicInfo from "../ItemFormPanel/ItemBasicInfo";
import AdditionalPiecesManager from "../ItemFormPanel/AdditionalPiecesManager";
import PrintingAreaSelector from "../ItemFormPanel/PrintingAreaSelector";
import ColorsPrintingConfig from "../ItemFormPanel/ColorsPrintingConfig";

/**
 * Paso 1: Información Básica + Configuración de Impresión
 * Fusiona los antiguos pasos 1 y 2 en una sola vista
 */
const Step1Complete = ({
  currentItem,
  handleItemChange,
  addAdditionalPiece,
  removeAdditionalPiece,
  handleAdditionalPieceChange,
}) => {
  const isDigital = currentItem.printingAreaOption === "quarter_sheet_digital";

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Información Básica del Item */}
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
            Información Básica
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Ingresa los datos principales del item
          </p>
        </div>

        <ItemBasicInfo
          currentItem={currentItem}
          handleItemChange={handleItemChange}
        />

        <div className="mt-4 sm:mt-6">
          <AdditionalPiecesManager
            currentItem={currentItem}
            addAdditionalPiece={addAdditionalPiece}
            removeAdditionalPiece={removeAdditionalPiece}
            handleAdditionalPieceChange={handleAdditionalPieceChange}
          />
        </div>
      </div>

      {/* Configuración de Impresión */}
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
            Configuración de Impresión
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Define cómo se imprimirá tu trabajo
          </p>
        </div>

        <div className="mb-4 sm:mb-6">
          <PrintingAreaSelector
            currentItem={currentItem}
            handleItemChange={handleItemChange}
          />
        </div>

        {currentItem.printingAreaOption && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <ColorsPrintingConfig
              currentItem={currentItem}
              handleItemChange={handleItemChange}
            />
          </div>
        )}
      </div>

      {/* Indicador de ayuda */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400"
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
            <p className="text-xs sm:text-sm text-blue-700">
              <strong>Tip:</strong>{" "}
              {isDigital
                ? "En impresión digital, puedes activar la opción de dúplex sin costo adicional de plancha."
                : "Work-and-Turn te permite montar el tiro y retiro en una sola cara del pliego, reduciendo costos."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Step1Complete);
