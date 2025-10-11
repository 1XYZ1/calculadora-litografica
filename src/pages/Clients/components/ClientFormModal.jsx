import React from "react";
import ClientFormModalShared from "../../../components/ClientFormModal";

/**
 * Re-exportación del modal compartido para mantener compatibilidad
 * @deprecated Usar import desde src/components/ClientFormModal.jsx directamente
 */
function ClientFormModal(props) {
  return <ClientFormModalShared {...props} />;
}

export default React.memo(ClientFormModal);
