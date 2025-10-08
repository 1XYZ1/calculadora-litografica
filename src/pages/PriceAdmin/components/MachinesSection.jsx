import React from "react";
import { SECTION_COLORS, MACHINE_TYPE_OPTIONS } from "../../../utils/constants";

/**
 * Sección para gestionar tipos de máquina y precios por millar
 */
function MachinesSection({
  machineTypes,
  newMachineTypeName,
  setNewMachineTypeName,
  newMachineTypeMillarPrice,
  setNewMachineTypeMillarPrice,
  addMachineType,
  deleteMachineType,
}) {
  const colors = SECTION_COLORS.machines;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Precios de Máquinas (Millar)
      </h3>

      {/* Formulario para añadir nueva máquina */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select
          value={newMachineTypeName}
          onChange={(e) => setNewMachineTypeName(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Seleccione Máquina</option>
          {MACHINE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Precio por Millar (ej. 15.00)"
          value={newMachineTypeMillarPrice}
          onChange={(e) => setNewMachineTypeMillarPrice(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      <button
        onClick={addMachineType}
        className={`w-full ${colors.button} text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md`}
      >
        Añadir Tipo de Máquina
      </button>

      {/* Lista de máquinas existentes */}
      <ul className="mt-6 space-y-3">
        {machineTypes.map((machine) => (
          <li
            key={machine.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <span className="text-gray-800 font-medium">
              {machine.name} - ${machine.millarPrice.toFixed(2)} /millar
            </span>
            <button
              onClick={() => deleteMachineType(machine.id)}
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

export default React.memo(MachinesSection);
