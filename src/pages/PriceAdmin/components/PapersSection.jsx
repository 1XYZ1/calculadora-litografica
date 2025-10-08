import React from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Sección para gestionar precios de papel
 * Permite añadir nuevos tipos, actualizar precios y eliminar papeles
 */
function PapersSection({
  papers,
  newPaperName,
  setNewPaperName,
  newPaperPrice,
  setNewPaperPrice,
  paperPriceInputs,
  handlePaperPriceInputChange,
  addPaper,
  updatePaperPrice,
  deletePaper,
}) {
  const colors = SECTION_COLORS.papers;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Precios de Papel
      </h3>

      {/* Formulario para añadir nuevo papel */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
        <h4 className="text-xl font-bold text-gray-800 mb-4">
          Añadir Nuevo Tipo de Papel
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nombre del Papel (ej. GLASE 115GR)"
            value={newPaperName}
            onChange={(e) => setNewPaperName(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 md:col-span-1"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio por pliego (ej. 2.50)"
            value={newPaperPrice}
            onChange={(e) => setNewPaperPrice(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 md:col-span-1"
          />
          <button
            onClick={addPaper}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300 md:col-span-1"
          >
            Añadir Papel
          </button>
        </div>
      </div>

      {/* Lista de papeles existentes */}
      <ul className="space-y-3">
        {papers.map((paper) => (
          <li
            key={paper.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <span className="text-gray-800 font-medium md:col-span-1">
              {paper.name}
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="Precio por pliego"
              value={paperPriceInputs[paper.id] || ""}
              onChange={(e) =>
                handlePaperPriceInputChange(paper.id, e.target.value)
              }
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 md:col-span-1"
            />
            <button
              onClick={() => updatePaperPrice(paper.id)}
              className={`${colors.button} text-white font-bold py-3 rounded-lg transition duration-300 md:col-span-1`}
            >
              Actualizar
            </button>
            <button
              onClick={() => deletePaper(paper.id)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-300 md:col-span-1"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default React.memo(PapersSection);
