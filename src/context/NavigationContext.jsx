import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation debe ser usado dentro de NavigationProvider');
  }
  return context;
};

// Mapeo de páginas a breadcrumbs legibles
const pageToBreadcrumb = {
  'calculator': { label: 'Calculadora', icon: '🧮' },
  'clients': { label: 'Clientes', icon: '👥' },
  'priceProfiles': { label: 'Perfiles de Precios', icon: '💰' },
  'savedQuotations': { label: 'Cotizaciones Guardadas', icon: '📋' },
};

export const NavigationProvider = ({ children, currentPage, setCurrentPage }) => {
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Actualizar historial de navegación cuando cambia la página
  useEffect(() => {
    if (!currentPage) return;

    setNavigationHistory((prev) => {
      const newHistory = [...prev];

      // Evitar duplicados consecutivos
      if (newHistory.length === 0 || newHistory[newHistory.length - 1] !== currentPage) {
        newHistory.push(currentPage);

        // Limitar historial a 10 entradas
        if (newHistory.length > 10) {
          newHistory.shift();
        }
      }

      return newHistory;
    });
  }, [currentPage]);

  // Actualizar breadcrumbs basados en la página actual
  useEffect(() => {
    if (!currentPage) return;

    // Construir breadcrumbs
    const newBreadcrumbs = [
      { label: 'Inicio', page: 'calculator', icon: '🏠' }
    ];

    // Agregar breadcrumb de la página actual si no es calculator
    if (currentPage !== 'calculator') {
      const breadcrumbInfo = pageToBreadcrumb[currentPage];
      if (breadcrumbInfo) {
        newBreadcrumbs.push({
          label: breadcrumbInfo.label,
          page: currentPage,
          icon: breadcrumbInfo.icon,
          isActive: true
        });
      }
    }

    setBreadcrumbs(newBreadcrumbs);
  }, [currentPage]);

  // Función para navegar a una página con tracking
  const navigateTo = useCallback((page) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
  }, [setCurrentPage]);

  // Función para volver a la página anterior del historial
  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      // Ir a la página anterior en el historial
      const previousPage = navigationHistory[navigationHistory.length - 2];
      if (setCurrentPage) {
        setCurrentPage(previousPage);
      }
    } else {
      // Si no hay historial, ir al inicio (calculator)
      if (setCurrentPage) {
        setCurrentPage('calculator');
      }
    }
  }, [navigationHistory, setCurrentPage]);

  // Función para volver a una página específica del historial
  const goBackTo = useCallback((page) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
  }, [setCurrentPage]);

  // Verificar si hay una página anterior
  const canGoBack = navigationHistory.length > 1;

  // Obtener la página anterior
  const previousPage = navigationHistory.length > 1
    ? navigationHistory[navigationHistory.length - 2]
    : null;

  const value = {
    navigationHistory,
    breadcrumbs,
    navigateTo,
    goBack,
    goBackTo,
    canGoBack,
    previousPage,
    currentPage,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};