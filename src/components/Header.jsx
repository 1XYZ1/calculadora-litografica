import React, { useState } from "react";
import { useFirebase } from "../context/FirebaseContext";

export default function Header({ currentPage, setCurrentPage, onShowAuth }) {
  const { user, logout } = useFirebase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para navegar y cerrar el menú móvil
  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <nav className="container-main container-responsive py-4">
        {/* Container principal con logo y botones desktop/mobile */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-lg p-2 shadow-md">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <h1 className="text-white text-responsive-lg font-bold">
              Litografía Pro
            </h1>
          </div>

          {/* Navegación desktop (pantallas grandes) */}
          <div className="hidden lg:flex items-center space-x-3">
            {user && (
              <>
                <button
                  onClick={() => setCurrentPage("calculator")}
                  className={`btn-primary ${
                    currentPage === "calculator"
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-blue-500/80 text-white hover:bg-blue-500"
                  }`}
                >
                  Calculadora
                </button>
                <button
                  onClick={() => setCurrentPage("clients")}
                  className={`btn-primary ${
                    currentPage === "clients"
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-blue-500/80 text-white hover:bg-blue-500"
                  }`}
                >
                  Clientes
                </button>
                <button
                  onClick={() => setCurrentPage("priceProfiles")}
                  className={`btn-primary ${
                    currentPage === "priceProfiles"
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-blue-500/80 text-white hover:bg-blue-500"
                  }`}
                >
                  Configuración
                </button>
                <button
                  onClick={() => setCurrentPage("savedQuotations")}
                  className={`btn-primary ${
                    currentPage === "savedQuotations"
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-blue-500/80 text-white hover:bg-blue-500"
                  }`}
                >
                  Guardadas
                </button>
              </>
            )}

            {user ? (
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  />
                )}
                <div className="text-white text-responsive-sm">
                  <p className="font-semibold">{user.displayName}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-compact bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm hover:shadow-md"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                className="btn-primary bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-md hover:shadow-lg"
              >
                Iniciar Sesión
              </button>
            )}
          </div>

          {/* Botón hamburguesa (móviles) */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Info de usuario en móviles */}
            {user && user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              />
            )}

            {/* Botón hamburguesa */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/20 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  {/* Nombre de usuario en móviles */}
                  <div className="text-white text-responsive-sm px-4 py-2 bg-white/10 rounded-lg mb-2">
                    <p className="font-semibold">{user.displayName}</p>
                    <p className="text-sm text-white/80">{user.email}</p>
                  </div>

                  {/* Botones de navegación */}
                  <button
                    onClick={() => navigateTo("calculator")}
                    className={`btn-primary text-left ${
                      currentPage === "calculator"
                        ? "bg-white text-blue-700 shadow-md"
                        : "bg-blue-500/80 text-white hover:bg-blue-500"
                    }`}
                  >
                    📊 Calculadora
                  </button>
                  <button
                    onClick={() => navigateTo("clients")}
                    className={`btn-primary text-left ${
                      currentPage === "clients"
                        ? "bg-white text-blue-700 shadow-md"
                        : "bg-blue-500/80 text-white hover:bg-blue-500"
                    }`}
                  >
                    👥 Clientes
                  </button>
                  <button
                    onClick={() => navigateTo("priceProfiles")}
                    className={`btn-primary text-left ${
                      currentPage === "priceProfiles"
                        ? "bg-white text-blue-700 shadow-md"
                        : "bg-blue-500/80 text-white hover:bg-blue-500"
                    }`}
                  >
                    ⚙️ Configuración
                  </button>
                  <button
                    onClick={() => navigateTo("savedQuotations")}
                    className={`btn-primary text-left ${
                      currentPage === "savedQuotations"
                        ? "bg-white text-blue-700 shadow-md"
                        : "bg-blue-500/80 text-white hover:bg-blue-500"
                    }`}
                  >
                    💾 Guardadas
                  </button>

                  {/* Botón de cerrar sesión */}
                  <button
                    onClick={handleLogout}
                    className="mt-2 btn-primary bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm text-left"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onShowAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-primary bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-md"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
