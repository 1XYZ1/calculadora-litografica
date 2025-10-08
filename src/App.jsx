import React, { useState } from "react";
import { FirebaseProvider, useFirebase } from "./context/FirebaseContext";
import Header from "./components/Header";
import Calculator from "./pages/Calculator/Calculator";
import Clients from "./pages/Clients/Clients";
import PriceProfiles from "./pages/PriceProfiles/PriceProfiles";
import SavedQuotations from "./pages/SavedQuotations/SavedQuotations";
import AuthModal from "./components/AuthModal";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("calculator");
  const [loadedQuotationData, setLoadedQuotationData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState("");
  const { user, loginWithGoogle } = useFirebase();

  const handleLoadQuotation = (quotation) => {
    setLoadedQuotationData(quotation);
    setCurrentPage("calculator");
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError("");
      await loginWithGoogle();
      setShowAuthModal(false);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      setAuthError(getErrorMessage(error.code));
    }
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/popup-closed-by-user": "Ventana de inicio de sesión cerrada",
      "auth/popup-blocked": "El navegador bloqueó la ventana emergente",
      "auth/cancelled-popup-request": "Solicitud cancelada",
      "auth/account-exists-with-different-credential":
        "Ya existe una cuenta con este email",
      "auth/network-request-failed": "Error de conexión. Verifica tu internet",
      "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
    };
    return (
      errorMessages[errorCode] ||
      "Error al iniciar sesión. Por favor intenta de nuevo."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter antialiased">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onShowAuth={() => setShowAuthModal(true)}
      />

      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
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
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Litografía Pro
            </h1>
            <p className="text-gray-500 mb-10 text-lg">
              Tu solución profesional para cotizaciones de litografía
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Comenzar
            </button>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Seguro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Rápido</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Fácil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <main className="pt-4">
          {currentPage === "calculator" && (
            <Calculator
              loadedQuotation={loadedQuotationData}
              setLoadedQuotation={setLoadedQuotationData}
            />
          )}
          {currentPage === "clients" && <Clients />}
          {currentPage === "priceProfiles" && <PriceProfiles />}
          {currentPage === "savedQuotations" && (
            <SavedQuotations onLoadQuotation={handleLoadQuotation} />
          )}
        </main>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setAuthError("");
          }}
          onGoogleLogin={handleGoogleLogin}
          error={authError}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
