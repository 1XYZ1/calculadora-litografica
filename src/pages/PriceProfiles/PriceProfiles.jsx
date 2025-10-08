import React, { useState, useCallback } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import Toast from "../../components/Toast";
import ConfirmationModal from "../../components/ConfirmationModal";

// Hooks
import { usePriceData } from "./hooks/usePriceData";
import { usePriceProfilesList } from "./hooks/usePriceProfilesList";
import { usePriceProfileCRUD } from "./hooks/usePriceProfileCRUD";
import { useNotification } from "./hooks/useNotification";
import { usePaperManagement } from "./hooks/usePaperManagement";
import { useMaterialsManagement } from "./hooks/useMaterialsManagement";
import { useFinishingManagement } from "./hooks/useFinishingManagement";
import { useSettingsManagement } from "./hooks/useSettingsManagement";

// Componentes
import PriceProfileHeader from "./components/PriceProfileHeader";
import ProfileSelector from "./components/ProfileSelector";
import ProfileFormModal from "./components/ProfileFormModal";
import PapersSection from "./components/PapersSection";
import PlatesSection from "./components/PlatesSection";
import MachinesSection from "./components/MachinesSection";
import DigitalPrintingSection from "./components/DigitalPrintingSection";
import FinishingSection from "./components/FinishingSection";
import ProfitSection from "./components/ProfitSection";
import BcvRateSection from "./components/BcvRateSection";
import IvaSection from "./components/IvaSection";

/**
 * Componente principal del gestor de perfiles de precios
 * Permite crear, editar y duplicar perfiles de precios personalizados
 */
function PriceProfiles() {
  const { userId } = useFirebase();

  // Estado de perfil seleccionado
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // Estados para modales
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState("create");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Hook de lista de perfiles
  const { profiles, loading: profilesLoading } = usePriceProfilesList();

  // Hook de operaciones CRUD de perfiles
  const profileCRUD = usePriceProfileCRUD();

  // Hook de datos de precios del perfil seleccionado
  const priceData = usePriceData(selectedProfileId);

  // Hook de notificaciones
  const notification = useNotification();

  // Hooks de gestión por categoría (ahora con profileId)
  const paperMgmt = usePaperManagement(
    priceData.papers,
    notification,
    selectedProfileId
  );
  const materialsMgmt = useMaterialsManagement(
    notification,
    selectedProfileId,
    priceData.plateSizes,
    priceData.machineTypes
  );
  const finishingMgmt = useFinishingManagement(
    priceData.finishingPrices,
    notification,
    selectedProfileId
  );
  const settingsMgmt = useSettingsManagement(
    priceData.settings,
    notification,
    selectedProfileId
  );

  // Handler para crear nuevo perfil
  const handleCreateProfile = useCallback(() => {
    setProfileModalMode("create");
    setProfileModalOpen(true);
  }, []);

  // Handler para duplicar perfil actual
  const handleDuplicateProfile = useCallback(() => {
    if (!selectedProfileId) return;
    setProfileModalMode("duplicate");
    setProfileModalOpen(true);
  }, [selectedProfileId]);

  // Handler para editar nombre del perfil actual
  const handleEditProfile = useCallback(() => {
    if (!selectedProfileId) return;
    setProfileModalMode("edit");
    setProfileModalOpen(true);
  }, [selectedProfileId]);

  // Handler para abrir modal de confirmación de eliminación
  const handleDeleteProfile = useCallback(() => {
    if (!selectedProfileId) return;
    setDeleteModalOpen(true);
  }, [selectedProfileId]);

  // Handler para confirmar eliminación de perfil
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProfileId) return;

    try {
      await profileCRUD.deleteProfile(selectedProfileId);
      notification.showSuccess("Perfil eliminado exitosamente");
      setSelectedProfileId(null);
      setDeleteModalOpen(false);
    } catch (error) {
      notification.showError(error.message || "Error al eliminar el perfil");
      setDeleteModalOpen(false);
    }
  }, [selectedProfileId, profileCRUD, notification]);

  // Handler para submit del modal de perfil
  const handleProfileSubmit = useCallback(
    async (profileName) => {
      try {
        let result;

        if (profileModalMode === "create") {
          result = await profileCRUD.createProfile(profileName);
          setSelectedProfileId(result.profileId);
        } else if (profileModalMode === "duplicate") {
          result = await profileCRUD.duplicateProfile(
            selectedProfileId,
            profileName
          );
          setSelectedProfileId(result.profileId);
        } else if (profileModalMode === "edit") {
          result = await profileCRUD.updateProfileName(
            selectedProfileId,
            profileName
          );
        }

        notification.showSuccess(result.message);
        setProfileModalOpen(false);
      } catch (error) {
        notification.showError(error.message || "Error al procesar el perfil");
      }
    },
    [profileModalMode, selectedProfileId, profileCRUD, notification]
  );

  // Obtener el nombre del perfil actual para los modales
  const currentProfileName = profiles.find(
    (p) => p.id === selectedProfileId
  )?.name;

  return (
    <div className="p-0 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Toast de notificaciones */}
      <Toast
        message={notification.message}
        type={notification.messageType}
        onClose={notification.clearMessage}
      />

      {/* Modal de formulario de perfil */}
      <ProfileFormModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSubmit={handleProfileSubmit}
        mode={profileModalMode}
        currentName={currentProfileName}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Eliminar Perfil"
        message={`¿Estás seguro de que deseas eliminar el perfil "${currentProfileName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-none sm:rounded-2xl shadow-xl space-y-10">
        {/* Header */}
        <PriceProfileHeader />

        {/* Selector de perfil */}
        <ProfileSelector
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelectProfile={setSelectedProfileId}
          onCreateProfile={handleCreateProfile}
          onDuplicateProfile={handleDuplicateProfile}
          onEditProfile={handleEditProfile}
          onDeleteProfile={handleDeleteProfile}
          loading={profilesLoading}
        />

        {/* Mostrar secciones solo si hay un perfil seleccionado */}
        {selectedProfileId ? (
          <>
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
              digitalQuarterTiroInput={finishingMgmt.digitalQuarterTiroInput}
              setDigitalQuarterTiroInput={
                finishingMgmt.setDigitalQuarterTiroInput
              }
              digitalQuarterTiroRetiroInput={
                finishingMgmt.digitalQuarterTiroRetiroInput
              }
              setDigitalQuarterTiroRetiroInput={
                finishingMgmt.setDigitalQuarterTiroRetiroInput
              }
              updateAllDigitalPrinting={finishingMgmt.updateAllDigitalPrinting}
              loadingItemId={finishingMgmt.loadingItemId}
            />

            {/* Sección de acabados */}
            <FinishingSection
              finishingPrices={priceData.finishingPrices}
              uvPricesInput={finishingMgmt.uvPricesInput}
              handleUvPriceChange={finishingMgmt.handleUvPriceChange}
              rematePriceInput={finishingMgmt.rematePriceInput}
              setRematePriceInput={finishingMgmt.setRematePriceInput}
              laminadoMatePriceInput={finishingMgmt.laminadoMatePriceInput}
              setLaminadoMatePriceInput={
                finishingMgmt.setLaminadoMatePriceInput
              }
              laminadoBrillantePriceInput={
                finishingMgmt.laminadoBrillantePriceInput
              }
              setLaminadoBrillantePriceInput={
                finishingMgmt.setLaminadoBrillantePriceInput
              }
              signadoPriceInput={finishingMgmt.signadoPriceInput}
              setSignadoPriceInput={finishingMgmt.setSignadoPriceInput}
              troqueladoPriceInput={finishingMgmt.troqueladoPriceInput}
              setTroqueladoPriceInput={finishingMgmt.setTroqueladoPriceInput}
              updateAllUvPrices={finishingMgmt.updateAllUvPrices}
              updateAllOtherFinishings={finishingMgmt.updateAllOtherFinishings}
              loadingItemId={finishingMgmt.loadingItemId}
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
          </>
        ) : (
          <div className="text-center py-12">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              {profiles.length === 0
                ? "Crea tu primer perfil de precios para comenzar"
                : "Selecciona un perfil para editar sus precios"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceProfiles;
