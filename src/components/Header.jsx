import React from "react";
import { useFirebase } from "../context/FirebaseContext";

export default function Header({ currentPage, setCurrentPage, onShowAuth }) {
  const { user, logout } = useFirebase();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <nav className="flex flex-col lg:flex-row justify-between items-center max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
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
          <h1 className="text-white text-2xl lg:text-3xl font-bold">
            Litografía Pro
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {user && (
            <>
              <button
                onClick={() => setCurrentPage("calculator")}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                  currentPage === "calculator"
                    ? "bg-white text-blue-700 shadow-md"
                    : "bg-blue-500/80 text-white hover:bg-blue-500"
                }`}
              >
                Calculadora
              </button>
              <button
                onClick={() => setCurrentPage("clients")}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                  currentPage === "clients"
                    ? "bg-white text-blue-700 shadow-md"
                    : "bg-blue-500/80 text-white hover:bg-blue-500"
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setCurrentPage("priceProfiles")}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                  currentPage === "priceProfiles"
                    ? "bg-white text-blue-700 shadow-md"
                    : "bg-blue-500/80 text-white hover:bg-blue-500"
                }`}
              >
                Configuración
              </button>
              <button
                onClick={() => setCurrentPage("savedQuotations")}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium ${
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
              <div className="text-white text-sm hidden md:block">
                <p className="font-semibold">{user.displayName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={onShowAuth}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
