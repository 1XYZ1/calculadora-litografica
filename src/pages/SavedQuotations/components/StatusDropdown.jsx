import React from "react";
import { QUOTATION_STATUS_LABELS } from "../../../utils/constants";

/**
 * Componente dropdown para cambiar el estado de una cotización
 * Permite seleccionar entre: Pendiente de envío, Enviada, Aceptada
 */
const StatusDropdown = ({ currentStatus, quotationId, onStatusChange }) => {
  const statusOptions = ["pending", "sent", "accepted"];

  const handleChange = (e) => {
    const newStatus = e.target.value;
    onStatusChange(quotationId, newStatus);
  };

  return (
    <select
      value={currentStatus || "pending"}
      onChange={handleChange}
      className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 min-w-[140px]"
      title="Cambiar estado de la cotización"
    >
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {QUOTATION_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
};

export default StatusDropdown;
