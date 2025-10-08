import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";

/**
 * Hook para cargar clientes desde Firestore en tiempo real
 * Escucha cambios en la colección de clientes del usuario
 */
export function useClientsData() {
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

    // Query ordenado por fecha de creación descendente
    const q = query(clientsCollectionRef, orderBy("createdAt", "desc"));

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
        console.error("Error fetching clients:", err);
        setError("Error al cargar los clientes.");
        setLoading(false);
        setClients([]);
      }
    );

    // Cleanup: cancelar suscripción al desmontar
    return () => unsubscribe();
  }, [db, appId, userId]);

  return {
    clients,
    loading,
    error,
  };
}
