import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import { useClientProfile } from "../../../hooks/useClientProfile";
import { useDynamicPriceData } from "../hooks/useDynamicPriceData";

/**
 * Indicador del perfil de precios activo en Calculator
 * Muestra el perfil del cliente seleccionado con detalles en tooltip
 */
export default function PriceProfileIndicator({ clientId, clientName }) {
  const { db, appId, userId } = useFirebase();
  const { priceProfileId, loading: profileLoading } = useClientProfile(clientId);
  const { settings, loading: priceDataLoading } = useDynamicPriceData(clientId);

  const [profileName, setProfileName] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [loadingProfileName, setLoadingProfileName] = useState(true);

  // Obtener nombre del perfil
  useEffect(() => {
    if (!db || !userId || !priceProfileId) {
      setProfileName("");
      setLoadingProfileName(false);
      return;
    }

    const fetchProfileName = async () => {
      setLoadingProfileName(true);
      try {
        const profileDocRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/priceProfiles`,
          priceProfileId
        );
        const profileDoc = await getDoc(profileDocRef);

        if (profileDoc.exists()) {
          setProfileName(profileDoc.data().name || "Sin nombre");
        } else {
          setProfileName("Perfil no encontrado");
        }
      } catch (error) {
        console.error("Error fetching profile name:", error);
        setProfileName("Error");
      } finally {
        setLoadingProfileName(false);
      }
    };

    fetchProfileName();
  }, [db, appId, userId, priceProfileId]);

  // Si no hay cliente seleccionado, no mostrar nada
  if (!clientId || !clientName) {
    return null;
  }

  const isLoading = profileLoading || priceDataLoading || loadingProfileName;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 relative">
      <div className="flex items-start justify-between">
        {/* Información del cliente y perfil */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-sm font-semibold text-gray-800">
              Cliente: {clientName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Perfil:{" "}
              {isLoading ? (
                <span className="text-gray-400">Cargando...</span>
              ) : (
                <span className="font-medium text-indigo-700">
                  {profileName}
                </span>
              )}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              🟢 Activo
            </span>
          </div>
        </div>

        {/* Botón de información con tooltip */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
            aria-label="Ver detalles del perfil"
          >
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Tooltip con detalles */}
          {showTooltip && !isLoading && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
              <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>

              <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                Detalles del Perfil
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Margen de ganancia:</span>
                  <span className="font-semibold text-gray-800">
                    {settings.profit.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tasa BCV:</span>
                  <span className="font-semibold text-gray-800">
                    ${settings.bcv.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">IVA:</span>
                  <span className="font-semibold text-gray-800">
                    {settings.iva.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Los precios de esta cotización se calculan usando este perfil
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
