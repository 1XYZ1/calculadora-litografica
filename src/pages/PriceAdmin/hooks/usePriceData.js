import { useState, useEffect } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";

/**
 * Hook para cargar todos los datos de precios desde Firestore
 * Consolida los 7 listeners en un solo hook
 */
export function usePriceData() {
  const { db, appId, userId } = useFirebase();

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
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    // Referencias a colecciones y documentos
    const papersCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/papers`
    );
    const plateCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/plateSizes`
    );
    const machineCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/machineTypes`
    );
    const finishingCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/finishingPrices`
    );
    const settingsProfitDocRef = doc(
      db,
      `artifacts/${appId}/public/data/settings`,
      "profit"
    );
    const bcvRateDocRef = doc(
      db,
      `artifacts/${appId}/public/data/settings`,
      "bcvRate"
    );
    const ivaRateDocRef = doc(
      db,
      `artifacts/${appId}/public/data/settings`,
      "ivaRate"
    );

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
    // para asegurar que al menos un snapshot se haya recibido
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
  }, [db, appId, userId]);

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
    loading,
  };
}
