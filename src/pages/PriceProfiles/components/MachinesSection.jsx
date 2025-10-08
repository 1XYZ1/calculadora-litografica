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
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.5fr,auto] gap-4 mb-6">
        <div className="relative">
          <select
            value={newMachineTypeName}
            onChange={(e) => setNewMachineTypeName(e.target.value)}
            className="w-full appearance-none p-3 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
          >
            <option value="">Seleccione Máquina</option>
            {MACHINE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <input
          type="number"
          step="0.01"
          placeholder="Precio (ej. 15.00)"
          value={newMachineTypeMillarPrice}
          onChange={(e) => setNewMachineTypeMillarPrice(e.target.value)}
          className="p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        <button
          onClick={addMachineType}
          className={`${colors.button} text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg whitespace-nowrap`}
        >
          Añadir Máquina
        </button>
      </div>

      {/* Lista de máquinas existentes */}
      <ul className="space-y-3">
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
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
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
