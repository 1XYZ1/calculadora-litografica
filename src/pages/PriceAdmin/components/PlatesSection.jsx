import React from "react";
import { SECTION_COLORS, PLATE_SIZE_OPTIONS } from "../../../utils/constants";

/**
 * Sección para gestionar tamaños de plancha y sus precios
 */
function PlatesSection({
  plateSizes,
  newPlateSizeName,
  setNewPlateSizeName,
  newPlateSizePrice,
  setNewPlateSizePrice,
  addPlateSize,
  deletePlateSize,
}) {
  const colors = SECTION_COLORS.plates;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Precios de Planchas
      </h3>

      {/* Formulario para añadir nueva plancha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select
          value={newPlateSizeName}
          onChange={(e) => setNewPlateSizeName(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Seleccione Tamaño</option>
          {PLATE_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Precio por plancha (ej. 10.00)"
          value={newPlateSizePrice}
          onChange={(e) => setNewPlateSizePrice(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <button
        onClick={addPlateSize}
        className={`w-full ${colors.button} text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md`}
      >
        Añadir Tamaño de Plancha
      </button>

      {/* Lista de planchas existentes */}
      <ul className="mt-6 space-y-3">
        {plateSizes.map((plate) => (
          <li
            key={plate.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <span className="text-gray-800 font-medium">
              {plate.size} - ${plate.price.toFixed(2)} /plancha
            </span>
            <button
              onClick={() => deletePlateSize(plate.id)}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md transition duration-300"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default React.memo(PlatesSection);
