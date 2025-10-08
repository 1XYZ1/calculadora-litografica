import { useState, useEffect } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import { useClientProfile } from "../../../hooks/useClientProfile";

/**
 * Hook para cargar datos de precios dinámicamente según el cliente seleccionado
 * Si hay cliente, carga los precios de su perfil
 * Si no hay cliente, retorna datos vacíos
 *
 * @param {string} clientId - ID del cliente seleccionado
 */
export function useDynamicPriceData(clientId) {
  const { db, appId, userId } = useFirebase();

  // Obtener el profileId del cliente
  const { priceProfileId, loading: profileLoading } =
    useClientProfile(clientId);

  // Estados para datos de Firestore
  const [papers, setPapers] = useState([]);
  const [plateSizes, setPlateSizes] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [finishingPrices, setFinishingPrices] = useState({});
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [bcvRate, setBcvRate] = useState(0);
  const [ivaPercentage, setIvaPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay usuario o no hay profileId, resetear
    if (!db || !userId || !priceProfileId) {
      setPapers([]);
      setPlateSizes([]);
      setMachineTypes([]);
      setFinishingPrices({});
      setProfitPercentage(0);
      setBcvRate(0);
      setIvaPercentage(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Referencias a colecciones y documentos del perfil
    const profileBasePath = `artifacts/${appId}/users/${userId}/priceProfiles/${priceProfileId}`;

    const papersCollectionRef = collection(db, `${profileBasePath}/papers`);
    const plateCollectionRef = collection(db, `${profileBasePath}/plateSizes`);
    const machineCollectionRef = collection(
      db,
      `${profileBasePath}/machineTypes`
    );
    const finishingCollectionRef = collection(
      db,
      `${profileBasePath}/finishingPrices`
    );
    const settingsProfitDocRef = doc(
      db,
      `${profileBasePath}/settings`,
      "profit"
    );
    const bcvRateDocRef = doc(db, `${profileBasePath}/settings`, "bcvRate");
    const ivaRateDocRef = doc(db, `${profileBasePath}/settings`, "ivaRate");

    // Listener para papers
    const unsubscribePapers = onSnapshot(
      papersCollectionRef,
      (snapshot) => {
        const papersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPapers(papersData);
      },
      (error) => console.error("Error listening to papers:", error)
    );

    // Listener para plate sizes
    const unsubscribePlate = onSnapshot(
      plateCollectionRef,
      (snapshot) => {
        setPlateSizes(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (error) => console.error("Error listening to plate sizes:", error)
    );

    // Listener para machine types
    const unsubscribeMachine = onSnapshot(
      machineCollectionRef,
      (snapshot) => {
        setMachineTypes(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (error) => console.error("Error listening to machine types:", error)
    );

    // Listener para finishing prices
    const unsubscribeFinishing = onSnapshot(
      finishingCollectionRef,
      (snapshot) => {
        const data = {};
        snapshot.docs.forEach((doc) => {
          data[doc.id] = doc.data().price;
        });
        setFinishingPrices(data);
      },
      (error) => console.error("Error listening to finishing prices:", error)
    );

    // Listener para profit percentage
    const unsubscribeProfit = onSnapshot(
      settingsProfitDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfitPercentage(data.percentage || 0);
        } else {
          setProfitPercentage(0);
        }
      },
      (error) => console.error("Error listening to profit settings:", error)
    );

    // Listener para BCV rate
    const unsubscribeBcvRate = onSnapshot(
      bcvRateDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBcvRate(data.rate || 0);
        } else {
          setBcvRate(0);
        }
      },
      (error) => console.error("Error listening to BCV rate:", error)
    );

    // Listener para IVA percentage
    const unsubscribeIvaRate = onSnapshot(
      ivaRateDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIvaPercentage(data.percentage || 0);
        } else {
          setIvaPercentage(0);
        }
      },
      (error) => console.error("Error listening to IVA rate:", error)
    );

    // Marcar como cargado después de un breve delay
    const timer = setTimeout(() => setLoading(false), 500);

    // Cleanup: cancelar todas las suscripciones
    return () => {
      clearTimeout(timer);
      unsubscribePapers();
      unsubscribePlate();
      unsubscribeMachine();
      unsubscribeFinishing();
      unsubscribeProfit();
      unsubscribeBcvRate();
      unsubscribeIvaRate();
    };
  }, [db, appId, userId, priceProfileId]);

  return {
    papers,
    plateSizes,
    machineTypes,
    finishingPrices,
    settings: {
      profit: profitPercentage,
      bcv: bcvRate,
      iva: ivaPercentage,
    },
    loading: loading || profileLoading,
  };
}
