import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import ModalMessage from "../components/ModalMessage";

function PriceAdmin() {
  const { db, appId, userId } = useFirebase();

  // State for managing prices
  const [papers, setPapers] = useState([]);
  const [plateSizes, setPlateSizes] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [finishingPricesData, setFinishingPricesData] = useState({});
  const [profitPercentageData, setProfitPercentageData] = useState(0);
  const [bcvRateData, setBcvRateData] = useState(0);
  const [ivaPercentageData, setIvaPercentageData] = useState(0);

  // State for input forms
  const [paperPriceInputs, setPaperPriceInputs] = useState({});
  const [newPaperName, setNewPaperName] = useState("");
  const [newPaperPrice, setNewPaperPrice] = useState("");
  const [newPlateSizeName, setNewPlateSizeName] = useState("");
  const [newPlateSizePrice, setNewPlateSizePrice] = useState("");
  const [newMachineTypeName, setNewMachineTypeName] = useState("");
  const [newMachineTypeMillarPrice, setNewMachineTypeMillarPrice] =
    useState("");

  const [uvPricesInput, setUvPricesInput] = useState({
    half_sheet: "",
    quarter_sheet: "",
    tabloide: "",
    oficio: "",
    carta: "",
    quarter_sheet_digital: "",
  });

  const [rematePriceInput, setRematePriceInput] = useState("");
  const [laminadoMatePriceInput, setLaminadoMatePriceInput] = useState("");
  const [laminadoBrillantePriceInput, setLaminadoBrillantePriceInput] =
    useState("");
  const [signadoPriceInput, setSignadoPriceInput] = useState("");
  const [troqueladoPriceInput, setTroqueladoPriceInput] = useState("");
  const [digitalQuarterTiroInput, setDigitalQuarterTiroInput] = useState("");
  const [digitalQuarterTiroRetiroInput, setDigitalQuarterTiroRetiroInput] =
    useState("");
  const [profitPercentageInput, setProfitPercentageInput] = useState("");
  const [bcvRateInput, setBcvRateInput] = useState("");
  const [ivaPercentageInput, setIvaPercentageInput] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Firestore collection references
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

  useEffect(() => {
    if (!db || !userId) return;

    const unsubscribePapers = onSnapshot(
      papersCollectionRef,
      (snapshot) => {
        const papersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPapers(papersData);
        const initialInputs = {};
        papersData.forEach((paper) => {
          initialInputs[paper.id] =
            paper.pricePerSheet !== undefined
              ? paper.pricePerSheet.toString()
              : "";
        });
        setPaperPriceInputs(initialInputs);
      },
      (error) => console.error("Error listening to papers:", error)
    );

    const unsubscribePlate = onSnapshot(
      plateCollectionRef,
      (snapshot) => {
        setPlateSizes(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (error) => console.error("Error listening to plate sizes:", error)
    );
    const unsubscribeMachine = onSnapshot(
      machineCollectionRef,
      (snapshot) => {
        setMachineTypes(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (error) => console.error("Error listening to machine types:", error)
    );

    const unsubscribeFinishing = onSnapshot(
      finishingCollectionRef,
      (snapshot) => {
        const data = {};
        snapshot.docs.forEach((doc) => {
          data[doc.id] = doc.data().price;
        });
        setFinishingPricesData(data);
        setUvPricesInput({
          half_sheet: data["uv_half_sheet"]?.toString() || "",
          quarter_sheet: data["uv_quarter_sheet"]?.toString() || "",
          tabloide: data["uv_tabloide"]?.toString() || "",
          oficio: data["uv_oficio"]?.toString() || "",
          carta: data["uv_carta"]?.toString() || "",
          quarter_sheet_digital:
            data["uv_quarter_sheet_digital"]?.toString() || "",
        });
        setRematePriceInput(
          data["remate"] !== undefined ? data["remate"].toString() : ""
        );
        setLaminadoMatePriceInput(
          data["laminado_mate"] !== undefined
            ? data["laminado_mate"].toString()
            : ""
        );
        setLaminadoBrillantePriceInput(
          data["laminado_brillante"] !== undefined
            ? data["laminado_brillante"].toString()
            : ""
        );
        setSignadoPriceInput(
          data["signado"] !== undefined ? data["signado"].toString() : ""
        );
        setTroqueladoPriceInput(
          data["troquelado"] !== undefined ? data["troquelado"].toString() : ""
        );
        setDigitalQuarterTiroInput(
          data["digital_quarter_tiro"] !== undefined
            ? data["digital_quarter_tiro"].toString()
            : ""
        );
        setDigitalQuarterTiroRetiroInput(
          data["digital_quarter_tiro_retiro"] !== undefined
            ? data["digital_quarter_tiro_retiro"].toString()
            : ""
        );
      },
      (error) => console.error("Error listening to finishing prices:", error)
    );

    const unsubscribeProfit = onSnapshot(
      settingsProfitDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfitPercentageData(data.percentage || 0);
          setProfitPercentageInput(
            data.percentage !== undefined
              ? (data.percentage * 100).toString()
              : ""
          );
        } else {
          setProfitPercentageData(0);
          setProfitPercentageInput("");
        }
      },
      (error) => console.error("Error listening to profit settings:", error)
    );
    const unsubscribeBcvRate = onSnapshot(
      bcvRateDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBcvRateData(data.rate || 0);
          setBcvRateInput(data.rate !== undefined ? data.rate.toFixed(2) : "");
        } else {
          setBcvRateData(0);
          setBcvRateInput("");
        }
      },
      (error) => console.error("Error listening to BCV rate:", error)
    );
    const unsubscribeIvaRate = onSnapshot(
      ivaRateDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIvaPercentageData(data.percentage || 0);
          setIvaPercentageInput(
            data.percentage !== undefined
              ? (data.percentage * 100).toString()
              : ""
          );
        } else {
          setIvaPercentageData(0);
          setIvaPercentageInput("");
        }
      },
      (error) => console.error("Error listening to IVA rate:", error)
    );

    return () => {
      unsubscribePapers();
      unsubscribePlate();
      unsubscribeMachine();
      unsubscribeFinishing();
      unsubscribeProfit();
      unsubscribeBcvRate();
      unsubscribeIvaRate();
    };
  }, [db, appId, userId]);

  const handlePaperPriceInputChange = (paperId, value) => {
    setPaperPriceInputs((prev) => ({ ...prev, [paperId]: value }));
  };
  const handleUvPriceChange = (size, value) => {
    setUvPricesInput((prev) => ({ ...prev, [size]: value }));
  };

  const updatePaperPrice = async (paperId) => {
    if (!userId) {
      setModalMessage("Debe estar autenticado.");
      return;
    }
    const priceStr = paperPriceInputs[paperId];
    const price = parseFloat(priceStr);
    const paperName = papers.find((p) => p.id === paperId)?.name;
    if (priceStr === "" || isNaN(price) || price < 0) {
      setModalMessage(`Por favor, ingrese un precio válido para ${paperName}.`);
      return;
    }
    try {
      const docRef = doc(db, `artifacts/${appId}/public/data/papers`, paperId);
      await updateDoc(docRef, { pricePerSheet: price });
      setModalMessage(`Precio para ${paperName} actualizado correctamente.`);
    } catch (e) {
      console.error("Error updating paper price: ", e);
      setModalMessage("Error al actualizar el precio del papel.");
    }
  };

  const addPaper = async () => {
    if (!userId) {
      setModalMessage("Debe estar autenticado.");
      return;
    }
    if (!newPaperName || newPaperPrice === "") {
      setModalMessage(
        "Por favor, ingrese nombre y precio para el nuevo papel."
      );
      return;
    }
    const price = parseFloat(newPaperPrice);
    if (isNaN(price) || price < 0) {
      setModalMessage("El precio ingresado no es válido.");
      return;
    }

    const generatedId = newPaperName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    if (!generatedId) {
      setModalMessage("El nombre del papel no es válido.");
      return;
    }

    try {
      const docRef = doc(
        db,
        `artifacts/${appId}/public/data/papers`,
        generatedId
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setModalMessage(
          "Ya existe un papel con un nombre similar. Por favor, elija otro."
        );
        return;
      }
      await setDoc(docRef, { name: newPaperName.trim(), pricePerSheet: price });
      setModalMessage("Nuevo tipo de papel añadido correctamente.");
      setNewPaperName("");
      setNewPaperPrice("");
    } catch (e) {
      console.error("Error adding paper type: ", e);
      setModalMessage("Error al añadir el nuevo tipo de papel.");
    }
  };

  const deletePaper = async (paperId) => {
    if (!userId) {
      setModalMessage("Debe estar autenticado.");
      return;
    }
    try {
      await deleteDoc(
        doc(db, `artifacts/${appId}/public/data/papers`, paperId)
      );
      setModalMessage("Tipo de papel eliminado correctamente.");
    } catch (e) {
      console.error("Error deleting paper type: ", e);
      setModalMessage("Error al eliminar el tipo de papel.");
    }
  };

  const addPlateSize = async () => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    if (!newPlateSizeName || !newPlateSizePrice) {
      setModalMessage(
        "Por favor, complete todos los campos para el tamaño de plancha."
      );
      return;
    }
    try {
      await addDoc(plateCollectionRef, {
        size: newPlateSizeName,
        price: parseFloat(newPlateSizePrice),
      });
      setModalMessage("Tamaño de plancha añadido correctamente.");
      setNewPlateSizeName("");
      setNewPlateSizePrice("");
    } catch (e) {
      console.error("Error adding plate size: ", e);
      setModalMessage("Error al añadir el tamaño de plancha.");
    }
  };

  const deletePlateSize = async (id) => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/public/data/plateSizes`, id));
      setModalMessage("Tamaño de plancha eliminado correctamente.");
    } catch (e) {
      console.error("Error deleting plate size: ", e);
      setModalMessage("Error al eliminar el tipo de plancha.");
    }
  };

  const addMachineType = async () => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    if (!newMachineTypeName || !newMachineTypeMillarPrice) {
      setModalMessage(
        "Por favor, complete todos los campos para el tipo de máquina."
      );
      return;
    }
    try {
      await addDoc(machineCollectionRef, {
        name: newMachineTypeName,
        millarPrice: parseFloat(newMachineTypeMillarPrice),
      });
      setModalMessage("Tipo de máquina añadido correctamente.");
      setNewMachineTypeName("");
      setNewMachineTypeMillarPrice("");
    } catch (e) {
      console.error("Error adding machine type: ", e);
      setModalMessage("Error al añadir el tipo de máquina.");
    }
  };

  const deleteMachineType = async (id) => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    try {
      await deleteDoc(
        doc(db, `artifacts/${appId}/public/data/machineTypes`, id)
      );
      setModalMessage("Tipo de máquina eliminado correctamente.");
    } catch (e) {
      console.error("Error deleting machine type: ", e);
      setModalMessage("Error al eliminar el tipo de máquina.");
    }
  };

  const updateFinishingPrice = async (id, priceInput) => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    const price = parseFloat(priceInput);
    if (priceInput === "" || isNaN(price) || price < 0) {
      setModalMessage(
        `Por favor, ingrese un precio válido para ${id.replace(/_/g, " ")}.`
      );
      return;
    }
    try {
      const docRef = doc(
        db,
        `artifacts/${appId}/public/data/finishingPrices`,
        id
      );
      await setDoc(docRef, { price: price }, { merge: true });
      setModalMessage(
        `Precio de ${id.replace(/_/g, " ")} actualizado correctamente.`
      );
    } catch (e) {
      console.error(`Error updating ${id} price: `, e);
      setModalMessage(
        `Error al actualizar el precio de ${id.replace(/_/g, " ")}.`
      );
    }
  };

  const updateProfitPercentage = async () => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    const percentage = parseFloat(profitPercentageInput);
    if (profitPercentageInput === "" || isNaN(percentage) || percentage < 0) {
      setModalMessage("Por favor, ingrese un porcentaje de ganancia válido.");
      return;
    }
    try {
      await setDoc(
        settingsProfitDocRef,
        { percentage: percentage / 100 },
        { merge: true }
      );
      setModalMessage("Porcentaje de ganancia actualizado correctamente.");
    } catch (e) {
      console.error("Error updating profit percentage: ", e);
      setModalMessage("Error al actualizar el porcentaje de ganancia.");
    }
  };

  const updateBcvRate = async () => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    const rate = parseFloat(bcvRateInput);
    if (bcvRateInput === "" || isNaN(rate) || rate <= 0) {
      setModalMessage(
        "Por favor, ingrese una tasa de dólar BCV válida (mayor a 0)."
      );
      return;
    }
    try {
      await setDoc(bcvRateDocRef, { rate: rate }, { merge: true });
      setModalMessage("Tasa de dólar BCV actualizada correctamente.");
    } catch (e) {
      console.error("Error updating BCV rate: ", e);
      setModalMessage("Error al actualizar la tasa de dólar BCV.");
    }
  };

  const updateIvaPercentage = async () => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    const percentage = parseFloat(ivaPercentageInput);
    if (ivaPercentageInput === "" || isNaN(percentage) || percentage < 0) {
      setModalMessage("Por favor, ingrese un porcentaje de IVA válido.");
      return;
    }
    try {
      await setDoc(
        ivaRateDocRef,
        { percentage: percentage / 100 },
        { merge: true }
      );
      setModalMessage("Porcentaje de IVA actualizado correctamente.");
    } catch (e) {
      console.error("Error updating IVA percentage: ", e);
      setModalMessage("Error al actualizar el porcentaje de IVA.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ModalMessage
        message={modalMessage}
        onClose={() => setModalMessage("")}
      />
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-10">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">
          Administrador de Precios
        </h2>

        <section className="bg-blue-50 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-blue-700 mb-4">
            Precios de Papel
          </h3>
          <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-4">
              Añadir Nuevo Tipo de Papel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nombre del Papel (ej. GLASE 115GR)"
                value={newPaperName}
                onChange={(e) => setNewPaperName(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 md:col-span-1"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Precio por pliego (ej. 2.50)"
                value={newPaperPrice}
                onChange={(e) => setNewPaperPrice(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 md:col-span-1"
              />
              <button
                onClick={addPaper}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300 md:col-span-1"
              >
                Añadir Papel
              </button>
            </div>
          </div>
          <ul className="space-y-3">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <span className="text-gray-800 font-medium md:col-span-1">
                  {paper.name}
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio por pliego"
                  value={paperPriceInputs[paper.id] || ""}
                  onChange={(e) =>
                    handlePaperPriceInputChange(paper.id, e.target.value)
                  }
                  className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 md:col-span-1"
                />
                <button
                  onClick={() => updatePaperPrice(paper.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 md:col-span-1"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => deletePaper(paper.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-300 md:col-span-1"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-green-50 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-green-700 mb-4">
            Precios de Planchas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <select
              value={newPlateSizeName}
              onChange={(e) => setNewPlateSizeName(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Seleccione Tamaño</option>
              <option value="1/4 pliego">1/4 Pliego</option>
              <option value="1/2 pliego">1/2 Pliego</option>
              <option value="Tabloide">Tabloide</option>
              <option value="Pliego Completo">Pliego Completo</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Precio por plancha (ej. 10.00)"
              value={newPlateSizePrice}
              onChange={(e) => setNewPlateSizePrice(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            onClick={addPlateSize}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            Añadir Tamaño de Plancha
          </button>
          <ul className="mt-6 space-y-3">
            {plateSizes.map((plate) => (
              <li
                key={plate.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <span className="text-gray-800 font-medium">
                  {plate.size} - ${plate.price.toFixed(2)} /plancha
                </span>
                <button
                  onClick={() => deletePlateSize(plate.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md transition duration-300"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-purple-50 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-purple-700 mb-4">
            Precios de Máquinas (Millar)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <select
              value={newMachineTypeName}
              onChange={(e) => setNewMachineTypeName(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Seleccione Máquina</option>
              <option value="GTO">GTO</option>
              <option value="KORD">KORD</option>
              <option value="ABDICK">ABDICK</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Precio por Millar (ej. 15.00)"
              value={newMachineTypeMillarPrice}
              onChange={(e) => setNewMachineTypeMillarPrice(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button
            onClick={addMachineType}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            Añadir Tipo de Máquina
          </button>
          <ul className="mt-6 space-y-3">
            {machineTypes.map((machine) => (
              <li
                key={machine.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <span className="text-gray-800 font-medium">
                  {machine.name} - ${machine.millarPrice.toFixed(2)} /millar
                </span>
                <button
                  onClick={() => deleteMachineType(machine.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md transition duration-300"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-cyan-50 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-cyan-700 mb-4">
            Precios de Impresión Digital
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">
              1/4 Pliego Digital (Tiro):
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Precio por unidad"
              value={digitalQuarterTiroInput}
              onChange={(e) => setDigitalQuarterTiroInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            />
            <button
              onClick={() =>
                updateFinishingPrice(
                  "digital_quarter_tiro",
                  digitalQuarterTiroInput
                )
              }
              className="col-span-1 md:col-span-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              Actualizar Precio Tiro
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual: $
            {finishingPricesData["digital_quarter_tiro"] !== undefined
              ? finishingPricesData["digital_quarter_tiro"].toFixed(2)
              : "0.00"}{" "}
            /unidad
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">
              1/4 Pliego Digital (Tiro y Retiro):
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Precio por unidad"
              value={digitalQuarterTiroRetiroInput}
              onChange={(e) => setDigitalQuarterTiroRetiroInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            />
            <button
              onClick={() =>
                updateFinishingPrice(
                  "digital_quarter_tiro_retiro",
                  digitalQuarterTiroRetiroInput
                )
              }
              className="col-span-1 md:col-span-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              Actualizar Precio Tiro y Retiro
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual: $
            {finishingPricesData["digital_quarter_tiro_retiro"] !== undefined
              ? finishingPricesData["digital_quarter_tiro_retiro"].toFixed(2)
              : "0.00"}{" "}
            /unidad
          </p>
        </section>

        <section className="bg-yellow-50 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-yellow-700 mb-4">
            Precios de Acabados
          </h3>

          <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-4">
              Precios de UV por Tamaño (/unidad)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {[
                { key: "half_sheet", label: "Medio Pliego" },
                { key: "quarter_sheet", label: "Cuarto Pliego" },
                { key: "tabloide", label: "Tabloide" },
                { key: "oficio", label: "Oficio" },
                { key: "carta", label: "Carta" },
                { key: "quarter_sheet_digital", label: "Digital" },
              ].map((size) => (
                <div className="col-span-1" key={size.key}>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    {size.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Precio"
                      value={uvPricesInput[size.key]}
                      onChange={(e) =>
                        handleUvPriceChange(size.key, e.target.value)
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                    <button
                      onClick={() =>
                        updateFinishingPrice(
                          `uv_${size.key}`,
                          uvPricesInput[size.key]
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg transition duration-300"
                    >
                      OK
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Actual: $
                    {finishingPricesData[`uv_${size.key}`]?.toFixed(3) ||
                      "0.000"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">Remate:</label>
            <input
              type="number"
              step="0.01"
              placeholder="Precio por Millar de Pliegos"
              value={rematePriceInput}
              onChange={(e) => setRematePriceInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={() => updateFinishingPrice("remate", rematePriceInput)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              Actualizar Remate
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual: $
            {finishingPricesData["remate"] !== undefined
              ? finishingPricesData["remate"].toFixed(2)
              : "0.00"}{" "}
            /millar de pliegos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">Laminado Mate:</label>
            <input
              type="number"
              step="0.001"
              placeholder="Precio por Unidad (por cara)"
              value={laminadoMatePriceInput}
              onChange={(e) => setLaminadoMatePriceInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={() =>
                updateFinishingPrice("laminado_mate", laminadoMatePriceInput)
              }
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              Actualizar Laminado Mate
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual: $
            {finishingPricesData["laminado_mate"] !== undefined
              ? finishingPricesData["laminado_mate"].toFixed(3)
              : "0.000"}{" "}
            /unidad (por cara)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">
              Laminado Brillante:
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="Precio por Unidad (por cara)"
              value={laminadoBrillantePriceInput}
              onChange={(e) => setLaminadoBrillantePriceInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={() =>
                updateFinishingPrice(
                  "laminado_brillante",
                  laminadoBrillantePriceInput
                )
              }
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              Actualizar Laminado Brillante
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual: $
            {finishingPricesData["laminado_brillante"] !== undefined
              ? finishingPricesData["laminado_brillante"].toFixed(3)
              : "0.000"}{" "}
            /unidad (por cara)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">Signado:</label>
            <input
              type="number"
              step="0.01"
              placeholder="Precio por Millar de Pliegos"
              value={signadoPriceInput}
              onChange={(e) => setSignadoPriceInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={() => updateFinishingPrice("signado", signadoPriceInput)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              Actualizar Signado
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual: $
            {finishingPricesData["signado"] !== undefined
              ? finishingPricesData["signado"].toFixed(2)
              : "0.00"}{" "}
            /millar de pliegos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">Troquelado:</label>
            <input
              type="number"
              step="0.01"
              placeholder="Precio por Millar de Pliegos"
              value={troqueladoPriceInput}
              onChange={(e) => setTroqueladoPriceInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={() =>
                updateFinishingPrice("troquelado", troqueladoPriceInput)
              }
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              Actualizar Troquelado
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual: $
            {finishingPricesData["troquelado"] !== undefined
              ? finishingPricesData["troquelado"].toFixed(2)
              : "0.00"}{" "}
            /millar de pliegos
          </p>
        </section>

        <section className="bg-orange-50 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-orange-700 mb-4">
            Porcentaje de Ganancia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">Porcentaje (%):</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 20 (para 20%)"
              value={profitPercentageInput}
              onChange={(e) => setProfitPercentageInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={updateProfitPercentage}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              Actualizar Ganancia
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual:{" "}
            {profitPercentageData !== undefined
              ? (profitPercentageData * 100).toFixed(2)
              : "0.00"}
            %
          </p>
        </section>

        <section className="bg-teal-50 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-teal-700 mb-4">
            Tasa de Dólar BCV
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">Tasa (Bs./$):</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 36.50"
              value={bcvRateInput}
              onChange={(e) => setBcvRateInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              onClick={() => updateBcvRate()}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              Actualizar Tasa BCV
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual: Bs.{" "}
            {bcvRateData !== undefined ? bcvRateData.toFixed(2) : "0.00"} / $
          </p>
        </section>

        <section className="bg-pink-50 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-pink-700 mb-4">
            Porcentaje de IVA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <label className="text-gray-700 font-medium">Porcentaje (%):</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 16 (para 16%)"
              value={ivaPercentageInput}
              onChange={(e) => setIvaPercentageInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
            />
            <button
              onClick={() => updateIvaPercentage()}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              Actualizar IVA
            </button>
          </div>
          <p className="mt-2 text-gray-600 mb-4">
            Actual:{" "}
            {ivaPercentageData !== undefined
              ? (ivaPercentageData * 100).toFixed(2)
              : "0.00"}
            %
          </p>
        </section>

        <p className="text-center text-gray-500 text-sm mt-8">
          ID de Usuario: {userId}
        </p>
      </div>
    </div>
  );
}

export default PriceAdmin;
