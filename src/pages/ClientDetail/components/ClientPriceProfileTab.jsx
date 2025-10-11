import React, { useState } from "react";
import { usePriceProfilesList } from "../../PriceProfiles/hooks/usePriceProfilesList";

/**
 * Tab de perfil de precios del cliente
 * Muestra el perfil asignado y permite cambiarlo
 */
function ClientPriceProfileTab({ client, onUpdateProfile, saving }) {
  const { profiles, loading } = usePriceProfilesList();
  const [isChangingProfile, setIsChangingProfile] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(
    client?.priceProfileId || ""
  );

  React.useEffect(() => {
    if (client?.priceProfileId) {
      setSelectedProfileId(client.priceProfileId);
    }
  }, [client]);

  const currentProfile = profiles.find((p) => p.id === client?.priceProfileId);

  const handleChangeProfile = async () => {
    if (selectedProfileId === client?.priceProfileId) {
      setIsChangingProfile(false);
      return;
    }

    const result = await onUpdateProfile({ priceProfileId: selectedProfileId });
    if (result.success) {
      setIsChangingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Perfil actual */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Perfil de Precios Activo</h3>
        </div>

        <div className="p-6">
          {currentProfile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-1">
                    {currentProfile.name}
                  </h4>
                  <p className="text-gray-600">
                    {currentProfile.description || "Sin descripción"}
                  </p>
                </div>
                {!isChangingProfile && (
                  <button
                    onClick={() => setIsChangingProfile(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Cambiar Perfil
                  </button>
                )}
              </div>

              {/* Detalles del perfil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {/* Margen de ganancia */}
                {currentProfile.settings?.profitPercentage !== undefined && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-600 font-medium mb-1">
                      Margen de Ganancia
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {currentProfile.settings.profitPercentage}%
                    </p>
                  </div>
                )}

                {/* Tasa BCV */}
                {currentProfile.settings?.bcvRate !== undefined && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-1">
                      Tasa BCV
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      Bs. {currentProfile.settings.bcvRate.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* IVA */}
                {currentProfile.settings?.ivaPercentage !== undefined && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                      IVA
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {currentProfile.settings.ivaPercentage}%
                    </p>
                  </div>
                )}

                {/* Papeles configurados */}
                {currentProfile.papers && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium mb-1">
                      Papeles Configurados
                    </p>
                    <p className="text-3xl font-bold text-orange-900">
                      {Object.keys(currentProfile.papers).length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-gray-600 mb-4">
                Este cliente no tiene un perfil de precios asignado
              </p>
              <button
                onClick={() => setIsChangingProfile(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Asignar Perfil
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selector de perfil (cuando está cambiando) */}
      {isChangingProfile && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-800">
              Seleccionar Nuevo Perfil
            </h3>
          </div>

          <div className="p-6">
            {profiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No hay perfiles de precios disponibles
                </p>
                <a
                  href="/price-profiles"
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Crear un perfil de precios
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lista de perfiles */}
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <label
                      key={profile.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedProfileId === profile.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="priceProfile"
                        value={profile.id}
                        checked={selectedProfileId === profile.id}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-gray-800">
                          {profile.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {profile.description || "Sin descripción"}
                        </p>
                        {profile.settings?.profitPercentage && (
                          <p className="text-xs text-gray-500 mt-1">
                            Margen: {profile.settings.profitPercentage}% | Tasa
                            BCV: Bs. {profile.settings.bcvRate?.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleChangeProfile}
                    disabled={saving || selectedProfileId === client?.priceProfileId}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Confirmar Cambio
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingProfile(false);
                      setSelectedProfileId(client?.priceProfileId || "");
                    }}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Advertencia si hay cambios */}
                {selectedProfileId !== client?.priceProfileId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                    <svg
                      className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Impacto del cambio de perfil
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Las cotizaciones futuras de este cliente usarán los
                        precios del nuevo perfil. Las cotizaciones existentes no
                        se verán afectadas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPriceProfileTab;
