import { useState, useEffect } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";

/**
 * Hook para cargar todos los datos desde Firestore
 * Consolida las 7 suscripciones en tiempo real
 */
export const useFirestoreData = ({ db, appId, userId }) => {
  const [paperTypes, setPaperTypes] = useState([]);
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

    const unsubscribers = [];

    // Suscripción a tipos de papel
    const unsubPapers = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/papers`),
      (snapshot) => {
        const papersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaperTypes(papersData);
      },
      (error) => console.error("Error loading papers:", error)
    );
    unsubscribers.push(unsubPapers);

    // Suscripción a tamaños de plancha
    const unsubPlates = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/plateSizes`),
      (snap) => {
        setPlateSizes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error loading plates:", error)
    );
    unsubscribers.push(unsubPlates);

    // Suscripción a tipos de máquina
    const unsubMachines = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/machineTypes`),
      (snap) => {
        setMachineTypes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error loading machines:", error)
    );
    unsubscribers.push(unsubMachines);

    // Suscripción a precios de acabados
    const unsubFinishing = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/finishingPrices`),
      (snap) => {
        const data = {};
        snap.docs.forEach((d) => {
          data[d.id] = d.data().price;
        });
        setFinishingPrices(data);
      },
      (error) => console.error("Error loading finishing prices:", error)
    );
    unsubscribers.push(unsubFinishing);

    // Suscripción al porcentaje de ganancia
    const unsubProfit = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/settings`, "profit"),
      (d) => {
        setProfitPercentage(d.exists() ? d.data().percentage : 0);
      },
      (error) => console.error("Error loading profit:", error)
    );
    unsubscribers.push(unsubProfit);

    // Suscripción a la tasa BCV
    const unsubBcv = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/settings`, "bcvRate"),
      (d) => {
        setBcvRate(d.exists() ? d.data().rate : 0);
      },
      (error) => console.error("Error loading BCV rate:", error)
    );
    unsubscribers.push(unsubBcv);

    // Suscripción al porcentaje de IVA
    const unsubIva = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/settings`, "ivaRate"),
      (d) => {
        setIvaPercentage(d.exists() ? d.data().percentage : 0);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading IVA rate:", error);
        setLoading(false);
      }
    );
    unsubscribers.push(unsubIva);

    // Cleanup: cancelar todas las suscripciones
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [db, appId, userId]);

  return {
    paperTypes,
    plateSizes,
    machineTypes,
    finishingPrices,
    profitPercentage,
    bcvRate,
    ivaPercentage,
    loading,
  };
};
