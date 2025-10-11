import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Calculator from '../pages/Calculator/Calculator';
import Clients from '../pages/Clients/Clients';
import PriceProfiles from '../pages/PriceProfiles/PriceProfiles';
import SavedQuotations from '../pages/SavedQuotations/SavedQuotations';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/calculator" replace />
      },
      {
        path: 'calculator',
        element: <Calculator />
      },
      {
        path: 'calculator/new',
        element: <Calculator />
      },
      {
        path: 'clients',
        element: <Clients />
      },
      {
        path: 'clients/:clientId',
        // Placeholder - se implementará en iteración 5
        element: <Clients />
      },
      {
        path: 'price-profiles',
        element: <PriceProfiles />
      },
      {
        path: 'quotations',
        element: <SavedQuotations />
      }
    ]
  }
]);
