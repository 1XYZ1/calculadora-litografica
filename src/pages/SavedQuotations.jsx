import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import ModalMessage from "../components/ModalMessage";
import ConfirmationModal from "../components/ConfirmationModal";

export default function SavedQuotations({ onLoadQuotation }) {
  const { db, appId, userId } = useFirebase();
  const [savedQuotations, setSavedQuotations] = useState([]);
  const [loadingQuotations, setLoadingQuotations] = useState(true);
  const [modalMessage, setModalMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedQuotations, setSelectedQuotations] = useState([]);
  const [confirmModalState, setConfirmModalState] = useState(null);

  const quotationsCollectionRef = useCallback(() => {
    if (db && appId && userId)
      return collection(db, `artifacts/${appId}/users/${userId}/quotations`);
    return null;
  }, [db, appId, userId]);

  useEffect(() => {
    if (!userId) {
      setLoadingQuotations(false);
      setSavedQuotations([]);
      return;
    }
    const currentQuotationsCollectionRef = quotationsCollectionRef();
    if (!currentQuotationsCollectionRef) {
      setLoadingQuotations(false);
      setSavedQuotations([]);
      setSelectedQuotations([]);
      return;
    }

    setLoadingQuotations(true);
    let q = query(currentQuotationsCollectionRef, orderBy("timestamp", "desc"));
    if (startDate || endDate) {
      const startOfDay = startDate ? new Date(startDate) : new Date(0);
      if (startDate) startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = endDate ? new Date() : new Date();
      if (endDate) endOfDay.setHours(23, 59, 59, 999);
      q = query(
        currentQuotationsCollectionRef,
        where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
        where("timestamp", "<=", Timestamp.fromDate(endOfDay)),
        orderBy("timestamp", "desc")
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedQuotations(data);
        setLoadingQuotations(false);
        setSelectedQuotations((prev) =>
          prev.filter((id) => data.some((q) => q.id === id))
        );
      },
      (error) => {
        console.error("Error fetching saved quotations:", error);
        setModalMessage("Error al cargar las cotizaciones guardadas.");
        setLoadingQuotations(false);
        setSavedQuotations([]);
        setSelectedQuotations([]);
      }
    );

    return () => unsubscribe();
  }, [quotationsCollectionRef, startDate, endDate, userId]);

  const handleToggleSelect = (quotationId) => {
    setSelectedQuotations((prev) =>
      prev.includes(quotationId)
        ? prev.filter((id) => id !== quotationId)
        : [...prev, quotationId]
    );
  };

  const confirmDeleteSingle = (id, name) => {
    setConfirmModalState({ type: "single", data: { id, name } });
  };

  const confirmDeleteSelected = () => {
    if (selectedQuotations.length === 0) {
      setModalMessage("No hay cotizaciones seleccionadas.");
      return;
    }
    setConfirmModalState({ type: "multiple", data: selectedQuotations });
  };

  const executeDelete = async (ids) => {
    if (!userId) {
      setModalMessage("Debe estar autenticado para realizar esta acción.");
      return;
    }
    setConfirmModalState(null);
    const currentRef = quotationsCollectionRef();
    if (!currentRef) {
      setModalMessage("Error de inicialización.");
      return;
    }
    const promises = ids.map((id) => deleteDoc(doc(currentRef, id)));
    const results = await Promise.allSettled(promises);
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    if (successCount > 0)
      setModalMessage(
        `Se eliminaron ${successCount} cotización(es) correctamente.`
      );
    if (successCount < ids.length)
      setModalMessage(
        `Error al eliminar ${ids.length - successCount} cotización(es).`
      );
    setSelectedQuotations([]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return (
      timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    ).toLocaleString("es-VE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ModalMessage
        message={modalMessage}
        onClose={() => setModalMessage("")}
      />
      {confirmModalState && (
        <ConfirmationModal
          message={
            confirmModalState.type === "single"
              ? `¿Seguro que quieres eliminar "${confirmModalState.data.name}"?`
              : `¿Seguro que quieres eliminar ${confirmModalState.data.length} cotizacion(es)?`
          }
          onConfirm={() =>
            executeDelete(
              confirmModalState.type === "single"
                ? [confirmModalState.data.id]
                : confirmModalState.data
            )
          }
          onCancel={() => setConfirmModalState(null)}
        />
      )}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">
          Cotizaciones Guardadas
        </h2>
        <section className="bg-blue-50 p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-2xl font-bold text-blue-700 mb-4">
            Filtrar por Fecha
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Fecha de Inicio:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Fecha de Fin:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full"
              />
            </div>
          </div>
        </section>
        {savedQuotations.length > 0 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={confirmDeleteSelected}
              disabled={selectedQuotations.length === 0}
              className={`px-6 py-2 rounded-lg transition duration-300 shadow-md text-sm ${
                selectedQuotations.length > 0
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Eliminar Seleccionadas ({selectedQuotations.length})
            </button>
          </div>
        )}
        {loadingQuotations ? (
          <div className="text-center text-gray-600">Cargando...</div>
        ) : savedQuotations.length === 0 ? (
          <div className="text-center text-gray-600">
            No hay cotizaciones guardadas.
          </div>
        ) : (
          <ul className="space-y-4">
            {savedQuotations.map((q) => (
              <li
                key={q.id}
                className="bg-white p-6 rounded-xl shadow-md border flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 rounded mr-3"
                    checked={selectedQuotations.includes(q.id)}
                    onChange={() => handleToggleSelect(q.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-gray-900 break-words">
                      {q.name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {formatDate(q.timestamp)}
                    </p>
                    {q.grandTotals && (
                      <p className="text-md text-gray-700 mt-2">
                        <span className="font-semibold">Total:</span> $
                        {(q.grandTotals.totalGeneral || 0).toFixed(2)} |{" "}
                        <span className="font-semibold">Bs.:</span>{" "}
                        {(q.grandTotals.totalCostInBs || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={() => onLoadQuotation(q)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => confirmDeleteSingle(q.id, q.name)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
