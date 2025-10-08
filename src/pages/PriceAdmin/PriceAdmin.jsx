import React from "react";
import { useFirebase } from "../../context/FirebaseContext";
import ModalMessage from "../../components/ModalMessage";

// Hooks
import { usePriceData } from "./hooks/usePriceData";
import { useNotification } from "./hooks/useNotification";
import { usePaperManagement } from "./hooks/usePaperManagement";
import { useMaterialsManagement } from "./hooks/useMaterialsManagement";
import { useFinishingManagement } from "./hooks/useFinishingManagement";
import { useSettingsManagement } from "./hooks/useSettingsManagement";

// Componentes
import PriceAdminHeader from "./components/PriceAdminHeader";
import PapersSection from "./components/PapersSection";
import PlatesSection from "./components/PlatesSection";
import MachinesSection from "./components/MachinesSection";
import DigitalPrintingSection from "./components/DigitalPrintingSection";
import FinishingSection from "./components/FinishingSection";
import ProfitSection from "./components/ProfitSection";
import BcvRateSection from "./components/BcvRateSection";
import IvaSection from "./components/IvaSection";

/**
 * Componente principal del administrador de precios
 * Orquesta todos los hooks y componentes de sección
 */
function PriceAdmin() {
  const { userId } = useFirebase();

  // Hook de datos (carga todos los precios desde Firestore)
  const priceData = usePriceData();

  // Hook de notificaciones
  const notification = useNotification();

  // Hooks de gestión por categoría
  const paperMgmt = usePaperManagement(priceData.papers, notification);
  const materialsMgmt = useMaterialsManagement(notification);
  const finishingMgmt = useFinishingManagement(
    priceData.finishingPrices,
    notification
  );
  const settingsMgmt = useSettingsManagement(priceData.settings, notification);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Modal de mensajes */}
      <ModalMessage
        message={notification.message}
        onClose={notification.onClose}
      />

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-10">
        {/* Header */}
        <PriceAdminHeader />

        {/* Sección de papeles */}
        <PapersSection papers={priceData.papers} {...paperMgmt} />

        {/* Sección de planchas */}
        <PlatesSection
          plateSizes={priceData.plateSizes}
          {...materialsMgmt.plates}
        />

        {/* Sección de máquinas */}
        <MachinesSection
          machineTypes={priceData.machineTypes}
          {...materialsMgmt.machines}
        />

        {/* Sección de impresión digital */}
        <DigitalPrintingSection
          finishingPrices={priceData.finishingPrices}
          {...finishingMgmt}
        />

        {/* Sección de acabados */}
        <FinishingSection
          finishingPrices={priceData.finishingPrices}
          {...finishingMgmt}
        />

        {/* Sección de porcentaje de ganancia */}
        <ProfitSection {...settingsMgmt.profit} />

        {/* Sección de tasa BCV */}
        <BcvRateSection {...settingsMgmt.bcv} />

        {/* Sección de IVA */}
        <IvaSection {...settingsMgmt.iva} />

        {/* Footer con ID de usuario */}
        <p className="text-center text-gray-500 text-sm mt-8">
          ID de Usuario: {userId}
        </p>
      </div>
    </div>
  );
}

export default PriceAdmin;
