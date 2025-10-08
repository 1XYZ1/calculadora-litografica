import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";

/**
 * Hook para listar todos los perfiles de precios del usuario
 * Escucha cambios en tiempo real desde Firestore
 */
export function usePriceProfilesList() {
  const { db, appId, userId } = useFirebase();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay usuario autenticado, resetear estado
    if (!db || !userId) {
      setLoading(false);
      setProfiles([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Referencia a la colección de perfiles del usuario
    const profilesCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/priceProfiles`
    );

    // Query ordenado por fecha de creación
    const q = query(profilesCollectionRef, orderBy("createdAt", "desc"));

    // Listener en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProfiles(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching price profiles:", err);
        setError("Error al cargar los perfiles de precios.");
        setLoading(false);
        setProfiles([]);
      }
    );

    // Cleanup: cancelar suscripción al desmontar
    return () => unsubscribe();
  }, [db, appId, userId]);

  return {
    profiles,
    loading,
    error,
  };
}
