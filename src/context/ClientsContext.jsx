import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';

const ClientsContext = createContext();

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients debe ser usado dentro de ClientsProvider');
  }
  return context;
};

export const ClientsProvider = ({ children }) => {
  const { db, appId, userId } = useFirebase();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay usuario, resetear estado
    if (!db || !userId) {
      setLoading(false);
      setClients([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Referencia a la colección de clientes
    const clientsCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/clients`
    );

    // Query ordenado por nombre
    const q = query(clientsCollectionRef, orderBy('name', 'asc'));

    // Listener en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClients(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching clients:', err);
        setError('Error al cargar los clientes.');
        setLoading(false);
        setClients([]);
      }
    );

    // Cleanup: cancelar suscripción al desmontar
    return () => unsubscribe();
  }, [db, appId, userId]);

  // Función helper para obtener un cliente por ID
  const getClientById = (clientId) => {
    return clients.find((client) => client.id === clientId);
  };

  // Función helper para obtener clientes activos (con cotizaciones recientes)
  const getActiveClients = () => {
    return clients.filter(
      (client) => client.quotationCount && client.quotationCount > 0
    );
  };

  // Función helper para ordenar clientes por última cotización
  const getClientsByLastQuotation = () => {
    return [...clients].sort((a, b) => {
      if (!a.lastQuotationDate) return 1;
      if (!b.lastQuotationDate) return -1;
      return b.lastQuotationDate.toDate() - a.lastQuotationDate.toDate();
    });
  };

  // Función helper para buscar clientes
  const searchClients = (searchTerm) => {
    if (!searchTerm) return clients;

    const term = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term) ||
        client.company?.toLowerCase().includes(term)
    );
  };

  const value = {
    clients,
    loading,
    error,
    getClientById,
    getActiveClients,
    getClientsByLastQuotation,
    searchClients,
  };

  return (
    <ClientsContext.Provider value={value}>
      {children}
    </ClientsContext.Provider>
  );
};
