import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import ModalMessage from "../components/ModalMessage";
import QuotationPreviewModal from "../components/QuotationPreviewModal";
import CostBreakdownModal from "../components/CostBreakdownModal";
import LayoutSketch from "../components/LayoutSketch";
import TroquelLayoutSketch from "../components/TroquelLayoutSketch";
import { initialItemState, initialQuotationState } from "../utils/constants";
import { calculateTroquelFit } from "../utils/calculations";

function QuotationCalculator({
  loadedQuotation = null,
  setLoadedQuotation = () => {},
}) {
  const { db, appId, userId } = useFirebase();
  const [mainQuotationName, setMainQuotationName] = useState(
    initialQuotationState.mainQuotationName
  );
  const [clientName, setClientName] = useState(
    initialQuotationState.clientName
  );
  const [items, setItems] = useState(initialQuotationState.items);
  const [currentItem, setCurrentItem] = useState({
    ...initialItemState,
    id: crypto.randomUUID(),
    quotationName: mainQuotationName,
  });

  const [paperTypes, setPaperTypes] = useState([]);
  const [plateSizes, setPlateSizes] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [finishingPrices, setFinishingPrices] = useState({});
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [bcvRate, setBcvRate] = useState(0);
  const [ivaPercentage, setIvaPercentage] = useState(0);

  const [currentItemResult, setCurrentItemResult] = useState({
    totalGeneral: 0,
  });
  const [layoutInfo, setLayoutInfo] = useState(null);
  const [troquelLayoutInfo, setTroquelLayoutInfo] = useState(null);
  const [grandTotals, setGrandTotals] = useState(
    initialQuotationState.grandTotals
  );

  const [editingQuotationId, setEditingQuotationId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);

  const [modalMessage, setModalMessage] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [breakdownModalItem, setBreakdownModalItem] = useState(null);

  const HALF_SHEET_WIDTH = 66,
    HALF_SHEET_HEIGHT = 48,
    QUARTER_SHEET_WIDTH = 46,
    QUARTER_SHEET_HEIGHT = 31,
    DIGITAL_QUARTER_SHEET_WIDTH = 46,
    DIGITAL_QUARTER_SHEET_HEIGHT = 32,
    TABLOIDE_WIDTH = 43,
    TABLOIDE_HEIGHT = 27.9,
    OFICIO_WIDTH = 32,
    OFICIO_HEIGHT = 22,
    CARTA_WIDTH = 27.94,
    CARTA_HEIGHT = 21.59;

  const calculateBestFit = (pieceW, pieceH, sheetW, sheetH, separation = 0) => {
    if (!pieceW || !pieceH || pieceW <= 0 || pieceH <= 0) {
      return {
        count: 0,
        cols: 0,
        rows: 0,
        rotated: false,
        occupiedW: 0,
        occupiedH: 0,
      };
    }

    const effPieceW = pieceW + separation;
    const effPieceH = pieceH + separation;

    // Normal orientation
    const cols1 =
      separation > 0
        ? Math.floor((sheetW + separation) / effPieceW)
        : Math.floor(sheetW / pieceW);
    const rows1 =
      separation > 0
        ? Math.floor((sheetH + separation) / effPieceH)
        : Math.floor(sheetH / pieceH);

    // Rotated orientation
    const cols2 =
      separation > 0
        ? Math.floor((sheetW + separation) / effPieceH)
        : Math.floor(sheetW / pieceH);
    const rows2 =
      separation > 0
        ? Math.floor((sheetH + separation) / effPieceW)
        : Math.floor(sheetH / pieceW);

    const fit1Count = cols1 * rows1;
    const fit2Count = cols2 * rows2;

    if (fit1Count >= fit2Count) {
      return {
        count: fit1Count,
        cols: cols1,
        rows: rows1,
        rotated: false,
        occupiedW: cols1 > 0 ? cols1 * pieceW + (cols1 - 1) * separation : 0,
        occupiedH: rows1 > 0 ? rows1 * pieceH + (rows1 - 1) * separation : 0,
      };
    } else {
      return {
        count: fit2Count,
        cols: cols2,
        rows: rows2,
        rotated: true,
        occupiedW: cols2 > 0 ? cols2 * pieceH + (cols2 - 1) * separation : 0,
        occupiedH: rows2 > 0 ? rows2 * pieceW + (rows2 - 1) * separation : 0,
      };
    }
  };

  const handleItemChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCurrentItem((prev) => {
      const newState = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // If user checks UV, and there's a printing area selected, auto-select the same size for UV.
      if (name === "isUVSelected" && checked && newState.printingAreaOption) {
        newState.uvSizeOption = newState.printingAreaOption;
      }

      // If user changes the printing area while UV is selected, sync the UV size.
      if (name === "printingAreaOption" && newState.isUVSelected) {
        newState.uvSizeOption = value;
      }

      return newState;
    });
  };

  const handleMainQuotationNameChange = (e) => {
    const newName = e.target.value;
    setMainQuotationName(newName);
    if (!editingItemId) {
      setCurrentItem((prev) => ({ ...prev, quotationName: newName }));
    }
  };

  const addAdditionalPiece = () => {
    setCurrentItem((prev) => ({
      ...prev,
      additionalPieces: [
        ...prev.additionalPieces,
        { id: crypto.randomUUID(), width: "", height: "", quantity: "" },
      ],
    }));
  };

  const removeAdditionalPiece = (id) => {
    setCurrentItem((prev) => ({
      ...prev,
      additionalPieces: prev.additionalPieces.filter((p) => p.id !== id),
    }));
  };

  const handleAdditionalPieceChange = (id, field, value) => {
    setCurrentItem((prev) => ({
      ...prev,
      additionalPieces: prev.additionalPieces.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  useEffect(() => {
    if (!db || !userId) return;
    const unsubPapers = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/papers`),
      (snapshot) => {
        const papersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaperTypes(papersData);
      }
    );
    const unsubPlates = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/plateSizes`),
      (snap) => setPlateSizes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubMachines = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/machineTypes`),
      (snap) =>
        setMachineTypes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubFinishing = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/finishingPrices`),
      (snap) => {
        const data = {};
        snap.docs.forEach((d) => {
          data[d.id] = d.data().price;
        });
        setFinishingPrices(data);
      }
    );
    const unsubProfit = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/settings`, "profit"),
      (d) => setProfitPercentage(d.exists() ? d.data().percentage : 0)
    );
    const unsubBcv = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/settings`, "bcvRate"),
      (d) => setBcvRate(d.exists() ? d.data().rate : 0)
    );
    const unsubIva = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/settings`, "ivaRate"),
      (d) => setIvaPercentage(d.exists() ? d.data().percentage : 0)
    );
    return () => {
      unsubPapers();
      unsubPlates();
      unsubMachines();
      unsubFinishing();
      unsubProfit();
      unsubBcv();
      unsubIva();
    };
  }, [db, appId, userId]);

  useEffect(() => {
    if (loadedQuotation) {
      setMainQuotationName(loadedQuotation.name || "");
      setClientName(loadedQuotation.clientName || "");
      setItems(loadedQuotation.items || []);
      setEditingQuotationId(loadedQuotation.id);
      setLoadedQuotation(null);
    }
  }, [loadedQuotation, setLoadedQuotation]);

  useEffect(() => {
    if (currentItem.isTalonarios) {
      const { numTalonarios, sheetsPerSet, copiesPerSet } = currentItem;
      const talonarios = parseInt(numTalonarios, 10);
      const sheets = parseInt(sheetsPerSet, 10);
      const copies = parseInt(copiesPerSet, 10) || 0;

      if (
        !isNaN(talonarios) &&
        !isNaN(sheets) &&
        talonarios > 0 &&
        sheets > 0
      ) {
        const total = talonarios * sheets * (1 + copies);
        setCurrentItem((prev) => ({ ...prev, totalPieces: total.toString() }));
      } else {
        setCurrentItem((prev) => ({ ...prev, totalPieces: "" }));
      }
    }
  }, [
    currentItem.isTalonarios,
    currentItem.numTalonarios,
    currentItem.sheetsPerSet,
    currentItem.copiesPerSet,
  ]);

  useEffect(() => {
    if (
      !plateSizes.length ||
      !machineTypes.length ||
      !currentItem.printingAreaOption ||
      currentItem.printingAreaOption === "quarter_sheet_digital"
    )
      return;
    let plateToSelectId = "",
      machineToSelectId = "";
    if (currentItem.printingAreaOption === "half_sheet") {
      plateToSelectId =
        plateSizes.find((p) => p.size === "1/2 pliego")?.id || "";
      machineToSelectId = machineTypes.find((m) => m.name === "KORD")?.id || "";
    } else if (currentItem.printingAreaOption === "quarter_sheet") {
      plateToSelectId =
        plateSizes.find((p) => p.size === "1/4 pliego")?.id || "";
      machineToSelectId = machineTypes.find((m) => m.name === "GTO")?.id || "";
    } else if (
      ["tabloide", "oficio", "carta"].includes(currentItem.printingAreaOption)
    ) {
      plateToSelectId =
        plateSizes.find((p) => p.size.toLowerCase() === "tabloide")?.id || "";
      machineToSelectId =
        machineTypes.find((m) => m.name.toUpperCase() === "ABDICK")?.id || "";
    }
    setCurrentItem((prev) => ({
      ...prev,
      selectedPlateSizeId: plateToSelectId,
      selectedMachineTypeId: machineToSelectId,
    }));
  }, [currentItem.printingAreaOption, plateSizes, machineTypes]);

  useEffect(() => {
    const {
      totalPieces,
      pieceWidthCm,
      pieceHeightCm,
      printingAreaOption,
      isDigitalDuplex,
      isUVSelected,
      uvSizeOption,
      isRemateSelected,
      isLaminadoMateSelected,
      isLaminadoMateTiroRetiro,
      isLaminadoBrillanteSelected,
      isLaminadoBrillanteTiroRetiro,
      isSignadoSelected,
      isTroqueladoSelected,
      selectedPaperTypeId,
      sobrantePliegos,
      numColorsTiro,
      isTiroRetiro,
      numColorsRetiro,
      selectedMachineTypeId,
      selectedPlateSizeId,
      isWorkAndTurn,
      troquelPrice,
    } = currentItem;

    const mainPieces = parseFloat(totalPieces) || 0;
    const additionalPiecesQty = currentItem.additionalPieces.reduce(
      (sum, piece) => sum + (parseFloat(piece.quantity) || 0),
      0
    );

    const pieces = mainPieces; // The main calculation is driven by the main piece quantity
    const pWidth = parseFloat(pieceWidthCm);
    const pHeight = parseFloat(pieceHeightCm);
    const hasCustomDimensions = pWidth > 0 && pHeight > 0;

    if (
      !pieces ||
      !printingAreaOption ||
      (hasCustomDimensions && (!pWidth || !pHeight))
    ) {
      setCurrentItemResult({ totalGeneral: 0 });
      setLayoutInfo(null);
      return;
    }

    let baseCost = 0,
      finishingCost = 0,
      paperCost = 0,
      millarCost = 0,
      plateCost = 0;
    let requiredFullSheets = 0,
      numPlates = 0,
      pagesToPrint = 0,
      totalRuns = 0;
    let totalSheetsWithSobrante = 0;
    let newLayoutInfo = null;

    if (printingAreaOption === "quarter_sheet_digital") {
      const fit = hasCustomDimensions
        ? calculateBestFit(
            pWidth,
            pHeight,
            DIGITAL_QUARTER_SHEET_WIDTH,
            DIGITAL_QUARTER_SHEET_HEIGHT
          )
        : { count: 1 };

      if (hasCustomDimensions && fit.count > 0) {
        setLayoutInfo({
          ...fit,
          sheetW: DIGITAL_QUARTER_SHEET_WIDTH,
          sheetH: DIGITAL_QUARTER_SHEET_HEIGHT,
          pieceW: pWidth,
          pieceH: pHeight,
        });
      } else {
        setLayoutInfo(null);
      }

      pagesToPrint = hasCustomDimensions
        ? Math.ceil(pieces / fit.count)
        : pieces;
      const digitalPriceKey = isDigitalDuplex
        ? "digital_quarter_tiro_retiro"
        : "digital_quarter_tiro";
      millarCost = pagesToPrint * (finishingPrices[digitalPriceKey] || 0);
      baseCost = millarCost;
    } else {
      const isWorkAndTurnActive = isTiroRetiro && isWorkAndTurn;
      let printingSheetW = 0,
        printingSheetH = 0,
        printingSheetDivisor = 1;
      if (printingAreaOption === "half_sheet") {
        [printingSheetW, printingSheetH] = [
          HALF_SHEET_WIDTH,
          HALF_SHEET_HEIGHT,
        ];
        printingSheetDivisor = 2;
      } else if (printingAreaOption === "quarter_sheet") {
        [printingSheetW, printingSheetH] = [
          QUARTER_SHEET_WIDTH,
          QUARTER_SHEET_HEIGHT,
        ];
        printingSheetDivisor = 4;
      } else if (printingAreaOption === "tabloide") {
        [printingSheetW, printingSheetH] = [TABLOIDE_WIDTH, TABLOIDE_HEIGHT];
        printingSheetDivisor = 4;
      } else if (printingAreaOption === "oficio") {
        [printingSheetW, printingSheetH] = [OFICIO_WIDTH, OFICIO_HEIGHT];
        printingSheetDivisor = 9;
      } else if (printingAreaOption === "carta") {
        [printingSheetW, printingSheetH] = [CARTA_WIDTH, CARTA_HEIGHT];
        printingSheetDivisor = 9;
      }

      if (hasCustomDimensions && printingSheetW === 0) {
        setLayoutInfo(null);
        setCurrentItemResult({ totalGeneral: 0 });
        return;
      }

      const separation = isTroqueladoSelected ? 0.7 : 0;
      const fit = hasCustomDimensions
        ? calculateBestFit(
            pWidth,
            pHeight,
            printingSheetW,
            printingSheetH,
            separation
          )
        : { count: 1 };

      if (hasCustomDimensions) {
        if (fit.count > 0) {
          newLayoutInfo = {
            ...fit,
            sheetW: printingSheetW,
            sheetH: printingSheetH,
            pieceW: pWidth,
            pieceH: pHeight,
            separation,
            placedPieces: [],
            additionalYields: {},
          };
          const finalPieceW = fit.rotated ? pHeight : pWidth;
          const finalPieceH = fit.rotated ? pWidth : pHeight;
          const effPieceW = finalPieceW + separation;
          const effPieceH = finalPieceH + separation;
          for (let i = 0; i < fit.rows; i++) {
            for (let j = 0; j < fit.cols; j++) {
              newLayoutInfo.placedPieces.push({
                id: `main-${i}-${j}`,
                x: j * effPieceW,
                y: i * effPieceH,
                w: finalPieceW,
                h: finalPieceH,
                type: "main",
              });
            }
          }
        } else {
          setLayoutInfo(null);
        }
        if (fit.count === 0) {
          setCurrentItemResult({ totalGeneral: 0 });
          return;
        }
      } else {
        setLayoutInfo(null);
      }

      pagesToPrint = hasCustomDimensions
        ? Math.ceil(pieces / fit.count)
        : pieces;
      requiredFullSheets =
        printingSheetDivisor > 0
          ? Math.ceil(pagesToPrint / printingSheetDivisor)
          : 0;

      if (isWorkAndTurnActive) {
        numPlates = parseInt(numColorsTiro) || 0;
      } else {
        numPlates =
          (parseInt(numColorsTiro) || 0) +
          (isTiroRetiro ? parseInt(numColorsRetiro) || 0 : 0);
      }
      plateCost =
        numPlates *
        (plateSizes.find((p) => p.id === selectedPlateSizeId)?.price || 0);

      const sobrante = parseInt(sobrantePliegos, 10) || 0;
      totalSheetsWithSobrante = requiredFullSheets + sobrante;
      paperCost =
        totalSheetsWithSobrante *
        (paperTypes.find((p) => p.id === selectedPaperTypeId)?.pricePerSheet ||
          0);

      const colorsTiroNum = parseInt(numColorsTiro) || 0,
        colorsRetiroNum = parseInt(numColorsRetiro) || 0;
      const roundedPagesToPrint = Math.ceil(pagesToPrint / 1000) * 1000;
      if (isTiroRetiro) {
        if (isWorkAndTurnActive) {
          totalRuns = roundedPagesToPrint * colorsTiroNum * 2;
        } else {
          totalRuns =
            roundedPagesToPrint * colorsTiroNum +
            roundedPagesToPrint * colorsRetiroNum;
        }
      } else {
        totalRuns = roundedPagesToPrint * colorsTiroNum;
      }
      const millarPrice =
        machineTypes.find((m) => m.id === selectedMachineTypeId)?.millarPrice ||
        0;
      millarCost = (totalRuns / 1000) * millarPrice;
      baseCost = paperCost + millarCost + plateCost;

      if (newLayoutInfo && currentItem.additionalPieces.length > 0) {
        let availableWasteRects = [
          {
            id: "waste1",
            x: fit.occupiedW,
            y: 0,
            w: printingSheetW - fit.occupiedW,
            h: printingSheetH,
          },
          {
            id: "waste2",
            x: 0,
            y: fit.occupiedH,
            w: fit.occupiedW,
            h: printingSheetH - fit.occupiedH,
          },
        ].filter((r) => r.w > separation && r.h > separation);

        const sortedAdditionalPieces = [...currentItem.additionalPieces]
          .filter((p) => p.width && p.height)
          .sort((a, b) => b.width * b.height - a.width * a.height);

        for (const addPiece of sortedAdditionalPieces) {
          if (availableWasteRects.length === 0) break;
          let bestFit = null;
          let bestRectIndex = -1;

          for (let i = 0; i < availableWasteRects.length; i++) {
            const rect = availableWasteRects[i];
            const currentFit = calculateBestFit(
              parseFloat(addPiece.width),
              parseFloat(addPiece.height),
              rect.w,
              rect.h,
              separation
            );
            if (
              currentFit.count > 0 &&
              (!bestFit || currentFit.count > bestFit.count)
            ) {
              bestFit = currentFit;
              bestRectIndex = i;
            }
          }

          if (bestFit) {
            const rectToUse = availableWasteRects[bestRectIndex];
            newLayoutInfo.additionalYields[addPiece.id] = {
              countPerSheet: bestFit.count,
              name: `Pieza ${addPiece.width}x${addPiece.height}cm`,
            };
            const addPieceW = bestFit.rotated
              ? parseFloat(addPiece.height)
              : parseFloat(addPiece.width);
            const addPieceH = bestFit.rotated
              ? parseFloat(addPiece.width)
              : parseFloat(addPiece.height);
            const effAddW = addPieceW + separation;
            const effAddH = addPieceH + separation;

            for (let i = 0; i < bestFit.rows; i++) {
              for (let j = 0; j < bestFit.cols; j++) {
                newLayoutInfo.placedPieces.push({
                  id: `add-${addPiece.id}-${i}-${j}`,
                  x: rectToUse.x + j * effAddW,
                  y: rectToUse.y + i * effAddH,
                  w: addPieceW,
                  h: addPieceH,
                  type: "additional",
                });
              }
            }
            availableWasteRects.splice(bestRectIndex, 1);
          }
        }
      }
      setLayoutInfo(newLayoutInfo);
    }

    const pagesToPrintForFinishing = pagesToPrint;
    if (isUVSelected && uvSizeOption) {
      const uvPriceKey = `uv_${uvSizeOption}`;
      const uvPrice = finishingPrices[uvPriceKey] || 0;
      finishingCost += pagesToPrintForFinishing * uvPrice;
    }
    if (isLaminadoMateSelected)
      finishingCost +=
        pagesToPrintForFinishing *
        (finishingPrices["laminado_mate"] || 0) *
        (isLaminadoMateTiroRetiro ? 2 : 1);
    if (isLaminadoBrillanteSelected)
      finishingCost +=
        pagesToPrintForFinishing *
        (finishingPrices["laminado_brillante"] || 0) *
        (isLaminadoBrillanteTiroRetiro ? 2 : 1);
    if (printingAreaOption !== "quarter_sheet_digital") {
      const millarFullSheetsForFinishing = Math.ceil(requiredFullSheets / 1000);
      if (isRemateSelected)
        finishingCost +=
          millarFullSheetsForFinishing * (finishingPrices["remate"] || 0);
      if (isSignadoSelected)
        finishingCost +=
          millarFullSheetsForFinishing * (finishingPrices["signado"] || 0);
      if (isTroqueladoSelected)
        finishingCost +=
          millarFullSheetsForFinishing * (finishingPrices["troquelado"] || 0);
    }

    const manualTroquelPrice = parseFloat(troquelPrice) || 0;
    finishingCost += manualTroquelPrice;

    const totalCost = baseCost + finishingCost;
    const costWithProfit = totalCost * (1 + profitPercentage);

    setCurrentItemResult({
      totalGeneral: costWithProfit,
      costWithProfit,
      paperCost,
      plateCost,
      millarCost,
      finishingCost,
      requiredFullSheets,
      sobrantePliegos: parseInt(sobrantePliegos, 10) || 0,
      totalSheetsWithSobrante,
      numPlates,
      pagesToPrint,
      totalRuns,
    });

    if (isTroqueladoSelected) {
      const TROQUEL_SHEET_WIDTH = 29;
      const TROQUEL_SHEET_HEIGHT = 24.5;
      const SEPARATION = 0.7; // 7mm

      if (pWidth > 0 && pHeight > 0) {
        const fit = calculateTroquelFit(
          pWidth,
          pHeight,
          TROQUEL_SHEET_WIDTH,
          TROQUEL_SHEET_HEIGHT,
          SEPARATION
        );
        if (fit.count > 0) {
          setTroquelLayoutInfo({
            ...fit,
            sheetW: TROQUEL_SHEET_WIDTH,
            sheetH: TROQUEL_SHEET_HEIGHT,
            pieceW: pWidth,
            pieceH: pHeight,
            separation: SEPARATION,
          });
        } else {
          setTroquelLayoutInfo(null);
        }
      } else {
        setTroquelLayoutInfo(null);
      }
    } else {
      setTroquelLayoutInfo(null);
    }
  }, [
    currentItem,
    paperTypes,
    plateSizes,
    machineTypes,
    finishingPrices,
    profitPercentage,
  ]);

  useEffect(() => {
    const total = items.reduce((acc, item) => acc + item.totalGeneral, 0);
    setGrandTotals({
      totalGeneral: total,
      totalCostInBs: bcvRate > 0 ? total * bcvRate : 0,
    });
  }, [items, bcvRate]);

  const handleAddItemOrUpdate = () => {
    if (!currentItem.totalPieces || currentItemResult.totalGeneral === 0) {
      setModalMessage(
        "Por favor, complete los detalles del item antes de añadirlo."
      );
      return;
    }

    let cTiro = parseInt(currentItem.numColorsTiro) || 0,
      cRetiro = parseInt(currentItem.numColorsRetiro) || 0;
    let desc =
      cTiro > 0 ? `${cTiro === 4 ? "Full Color" : `${cTiro} colores`}` : "";
    if (currentItem.isTiroRetiro) {
      if (currentItem.isWorkAndTurn) {
        desc += ` / Retiro: ${
          cTiro === 4 ? "Full Color" : `${cTiro} colores`
        } (W&T)`;
      } else if (cRetiro > 0) {
        desc += ` / Retiro: ${
          cRetiro === 4 ? "Full Color" : `${cRetiro} colores`
        }`;
      }
    }

    const itemWithResult = {
      ...currentItem,
      ...currentItemResult,
      colorsDescription: desc || "N/A",
    };

    if (editingItemId) {
      setItems((prev) =>
        prev.map((item) => (item.id === editingItemId ? itemWithResult : item))
      );
      setModalMessage("Item actualizado correctamente.");
    } else {
      setItems((prev) => [...prev, itemWithResult]);
    }

    setCurrentItem({
      ...initialItemState,
      id: crypto.randomUUID(),
      quotationName: mainQuotationName,
    });
    setCurrentItemResult({ totalGeneral: 0 });
    setLayoutInfo(null);
    setEditingItemId(null);
    setTroquelLayoutInfo(null);
  };

  const handleEditItem = (itemToEdit) => {
    setCurrentItem(itemToEdit);
    setEditingItemId(itemToEdit.id);
  };
  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetQuotation = () => {
    setMainQuotationName(initialQuotationState.mainQuotationName);
    setClientName(initialQuotationState.clientName);
    setItems(initialQuotationState.items);
    setGrandTotals(initialQuotationState.grandTotals);
    setCurrentItem({
      ...initialItemState,
      id: crypto.randomUUID(),
      quotationName: initialQuotationState.mainQuotationName,
    });
    setCurrentItemResult({ totalGeneral: 0 });
    setLayoutInfo(null);
    setEditingQuotationId(null);
    setEditingItemId(null);
    setTroquelLayoutInfo(null);
  };

  const handleSaveQuotation = async () => {
    if (!userId) {
      setModalMessage("Debe estar autenticado.");
      return;
    }
    if (items.length === 0) {
      setModalMessage("Añada al menos un item para guardar la cotización.");
      return;
    }
    try {
      const quotationsCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/quotations`
      );
      const quotationData = {
        name: mainQuotationName,
        clientName,
        timestamp: Timestamp.now(),
        items,
        grandTotals,
      };
      await addDoc(quotationsCollectionRef, quotationData);
      setModalMessage(`Cotización "${mainQuotationName}" guardada.`);
      resetQuotation();
    } catch (e) {
      console.error("Error saving quotation: ", e);
      setModalMessage("Error al guardar la cotización.");
    }
  };

  const handleUpdateQuotation = async () => {
    if (!userId || !editingQuotationId) {
      setModalMessage("No se está editando ninguna cotización.");
      return;
    }
    if (items.length === 0) {
      setModalMessage("Añada al menos un item para actualizar la cotización.");
      return;
    }
    try {
      const quotationDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/quotations`,
        editingQuotationId
      );
      const quotationData = {
        name: mainQuotationName,
        clientName,
        timestamp: Timestamp.now(),
        items,
        grandTotals,
      };
      await updateDoc(quotationDocRef, quotationData);
      setModalMessage(`Cotización "${mainQuotationName}" actualizada.`);
      resetQuotation();
    } catch (e) {
      console.error("Error updating quotation: ", e);
      setModalMessage("Error al actualizar la cotización.");
    }
  };

  const handleShowPreview = () => {
    if (items.length === 0) {
      setModalMessage("Añada al menos un item para ver la vista previa.");
      return;
    }
    setShowPreviewModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      <ModalMessage
        message={modalMessage}
        onClose={() => setModalMessage("")}
      />
      {showPreviewModal && (
        <QuotationPreviewModal
          paperTypes={paperTypes}
          quotationData={{
            quotationName: mainQuotationName,
            clientName,
            items,
            date: new Date().toLocaleDateString("es-VE"),
            bcvRate,
            ...grandTotals,
          }}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
      <CostBreakdownModal
        item={breakdownModalItem}
        onClose={() => setBreakdownModalItem(null)}
      />
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-4">
          {editingQuotationId
            ? "Editando Presupuesto"
            : "Calculadora de Litografía"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="mainQuotationName"
            >
              Nombre del Presupuesto
            </label>
            <input
              id="mainQuotationName"
              type="text"
              value={mainQuotationName}
              onChange={handleMainQuotationNameChange}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
              placeholder="Ej. Papelería Corporativa"
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="clientName"
            >
              Nombre del Cliente
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
              placeholder="Ej. DIALCA"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 border border-gray-200 p-6 rounded-xl">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">
              {editingItemId ? "Editando Item" : "Añadir Item al Presupuesto"}
            </h3>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nombre del Item
              </label>
              <input
                name="quotationName"
                type="text"
                value={currentItem.quotationName}
                onChange={handleItemChange}
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
                placeholder="Ej. Tarjetas de Presentación"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  name="isTalonarios"
                  type="checkbox"
                  checked={currentItem.isTalonarios}
                  onChange={handleItemChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <label className="text-gray-700 text-sm font-bold">
                  Calcular por Talonarios
                </label>
              </div>
              {currentItem.isTalonarios && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1">
                      Cant. Talonarios
                    </label>
                    <input
                      name="numTalonarios"
                      type="number"
                      value={currentItem.numTalonarios}
                      onChange={handleItemChange}
                      className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3"
                      placeholder="Ej. 10"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1">
                      Cant. Hojas
                    </label>
                    <input
                      name="sheetsPerSet"
                      type="number"
                      value={currentItem.sheetsPerSet}
                      onChange={handleItemChange}
                      className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3"
                      placeholder="Ej. 50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1">
                      Cant. Copias
                    </label>
                    <input
                      name="copiesPerSet"
                      type="number"
                      value={currentItem.copiesPerSet}
                      onChange={handleItemChange}
                      className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3"
                      placeholder="Ej. 1"
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {currentItem.isTalonarios
                  ? "Total de Piezas (Calculado)"
                  : "Cantidad (Pieza Principal)"}
              </label>
              <input
                name="totalPieces"
                type="number"
                value={currentItem.totalPieces}
                onChange={handleItemChange}
                readOnly={currentItem.isTalonarios}
                className={`shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 ${
                  currentItem.isTalonarios ? "bg-gray-200" : ""
                }`}
                placeholder="Ej. 5000"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Dimensiones (cm)
              </label>
              <div className="flex gap-4">
                <input
                  name="pieceWidthCm"
                  type="number"
                  value={currentItem.pieceWidthCm}
                  onChange={handleItemChange}
                  className="shadow appearance-none border rounded-lg w-1/2 py-3 px-4"
                  placeholder="Ancho"
                />
                <input
                  name="pieceHeightCm"
                  type="number"
                  value={currentItem.pieceHeightCm}
                  onChange={handleItemChange}
                  className="shadow appearance-none border rounded-lg w-1/2 py-3 px-4"
                  placeholder="Alto"
                />
              </div>
            </div>

            {!currentItem.isTalonarios && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-gray-700 text-sm font-bold">
                    Piezas de Diferentes Tamaños (Opcional)
                  </h4>
                  <button
                    type="button"
                    onClick={addAdditionalPiece}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md text-sm"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-2">
                  {currentItem.additionalPieces.map((piece, index) => (
                    <div
                      key={piece.id}
                      className="grid grid-cols-4 gap-2 items-center"
                    >
                      <input
                        type="number"
                        placeholder="Ancho"
                        value={piece.width}
                        onChange={(e) =>
                          handleAdditionalPieceChange(
                            piece.id,
                            "width",
                            e.target.value
                          )
                        }
                        className="shadow-sm border rounded py-2 px-2 text-sm col-span-1"
                      />
                      <input
                        type="number"
                        placeholder="Alto"
                        value={piece.height}
                        onChange={(e) =>
                          handleAdditionalPieceChange(
                            piece.id,
                            "height",
                            e.target.value
                          )
                        }
                        className="shadow-sm border rounded py-2 px-2 text-sm col-span-1"
                      />
                      <input
                        type="number"
                        placeholder="Cant."
                        value={piece.quantity}
                        onChange={(e) =>
                          handleAdditionalPieceChange(
                            piece.id,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="shadow-sm border rounded py-2 px-2 text-sm col-span-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalPiece(piece.id)}
                        className="bg-red-500 text-white rounded px-2 py-1 text-xs col-span-1"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Área de Impresión
              </label>
              <select
                name="printingAreaOption"
                value={currentItem.printingAreaOption}
                onChange={handleItemChange}
                className="shadow border rounded-lg w-full py-3 px-4 text-gray-700"
              >
                <option value="">Seleccione un área</option>
                <option value="half_sheet">Medio Pliego (66x48 cm)</option>
                <option value="quarter_sheet">Cuarto Pliego (46x31 cm)</option>
                <option value="tabloide">Tabloide (43x27.9 cm)</option>
                <option value="oficio">Oficio (32x22 cm)</option>
                <option value="carta">Carta (27.9x21.6 cm)</option>
                <option value="quarter_sheet_digital">
                  Digital (46x32 cm)
                </option>
              </select>
            </div>
            {currentItem.printingAreaOption !== "quarter_sheet_digital" ? (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Colores (Tiro)
                  </label>
                  <input
                    name="numColorsTiro"
                    type="number"
                    value={currentItem.numColorsTiro}
                    onChange={handleItemChange}
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4"
                    placeholder="Ej. 4 (CMYK)"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    name="isTiroRetiro"
                    type="checkbox"
                    checked={currentItem.isTiroRetiro}
                    onChange={handleItemChange}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                  <label className="text-gray-700 text-sm font-bold">
                    ¿Tiro y Retiro?
                  </label>
                </div>
                {currentItem.isTiroRetiro && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mt-4">
                    <div className="flex items-center space-x-3">
                      <input
                        id="isWorkAndTurn"
                        name="isWorkAndTurn"
                        type="checkbox"
                        checked={currentItem.isWorkAndTurn}
                        onChange={handleItemChange}
                        className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="isWorkAndTurn"
                          className="text-gray-700 text-sm font-bold"
                        >
                          Montaje Tiro/Retiro en una cara (Work-and-Turn)
                        </label>
                        <p className="text-xs text-gray-500">
                          Monta el tiro y el retiro en la misma plancha, usando
                          una sola cara del pliego. El rendimiento por pliego se
                          divide entre 2. Requiere que quepan al menos 2 piezas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {currentItem.isTiroRetiro && (
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">
                      Colores (Retiro)
                    </label>
                    <input
                      name="numColorsRetiro"
                      type="number"
                      value={currentItem.numColorsRetiro}
                      onChange={handleItemChange}
                      className="shadow appearance-none border rounded-lg w-full py-3 px-4"
                      placeholder="Ej. 1 (Negro)"
                      disabled={currentItem.isWorkAndTurn}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {currentItem.isWorkAndTurn
                        ? "En modo Work-and-Turn, se asumen los mismos colores del tiro."
                        : ""}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Tipo de Papel
                  </label>
                  <select
                    name="selectedPaperTypeId"
                    value={currentItem.selectedPaperTypeId}
                    onChange={handleItemChange}
                    className="shadow border rounded-lg w-full py-3 px-4"
                  >
                    <option value="">Seleccione papel</option>
                    {paperTypes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${(p.pricePerSheet || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Sobrante (pliegos extra)
                  </label>
                  <input
                    name="sobrantePliegos"
                    type="number"
                    value={currentItem.sobrantePliegos}
                    onChange={handleItemChange}
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
                    placeholder="Ej. 10"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Tamaño de Plancha
                  </label>
                  <select
                    name="selectedPlateSizeId"
                    value={currentItem.selectedPlateSizeId}
                    onChange={handleItemChange}
                    className="shadow border rounded-lg w-full py-3 px-4"
                  >
                    <option value="">Seleccione plancha</option>
                    {plateSizes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.size} (${p.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Tipo de Máquina
                  </label>
                  <select
                    name="selectedMachineTypeId"
                    value={currentItem.selectedMachineTypeId}
                    onChange={handleItemChange}
                    className="shadow border rounded-lg w-full py-3 px-4"
                  >
                    <option value="">Seleccione máquina</option>
                    {machineTypes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (${m.millarPrice.toFixed(2)}/millar)
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 p-4 bg-cyan-50 rounded-lg">
                <input
                  name="isDigitalDuplex"
                  type="checkbox"
                  checked={currentItem.isDigitalDuplex}
                  onChange={handleItemChange}
                  className="h-5 w-5 text-cyan-600 rounded"
                />
                <label className="text-cyan-800 text-sm font-bold">
                  ¿Tiro y Retiro Digital?
                </label>
              </div>
            )}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">
                Acabados para este Item
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isUVSelected"
                    checked={currentItem.isUVSelected}
                    onChange={handleItemChange}
                    className="h-5 w-5 rounded"
                  />
                  <label className="text-sm font-bold">UV</label>
                  {currentItem.isUVSelected && (
                    <select
                      name="uvSizeOption"
                      value={currentItem.uvSizeOption}
                      onChange={handleItemChange}
                      className="shadow-sm border rounded-lg py-1 px-2 text-sm text-gray-700"
                    >
                      <option value="">Tamaño</option>
                      <option value="half_sheet">Medio Pliego</option>
                      <option value="quarter_sheet">Cuarto Pliego</option>
                      <option value="tabloide">Tabloide</option>
                      <option value="oficio">Oficio</option>
                      <option value="carta">Carta</option>
                      <option value="quarter_sheet_digital">Digital</option>
                    </select>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isRemateSelected"
                    checked={currentItem.isRemateSelected}
                    onChange={handleItemChange}
                    className="h-5 w-5 rounded"
                    disabled={
                      currentItem.printingAreaOption === "quarter_sheet_digital"
                    }
                  />
                  <label
                    className={`text-sm font-bold ${
                      currentItem.printingAreaOption ===
                        "quarter_sheet_digital" && "text-gray-400"
                    }`}
                  >
                    Remate
                  </label>
                </div>
                <div className="col-span-1 border-t pt-4 md:border-none md:pt-0">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isLaminadoMateSelected"
                      checked={currentItem.isLaminadoMateSelected}
                      onChange={handleItemChange}
                      className="h-5 w-5 rounded"
                    />
                    <label className="text-sm font-bold">Laminado Mate</label>
                  </div>
                  {currentItem.isLaminadoMateSelected && (
                    <div className="flex items-center space-x-3 mt-2 ml-8">
                      <input
                        type="checkbox"
                        name="isLaminadoMateTiroRetiro"
                        checked={currentItem.isLaminadoMateTiroRetiro}
                        onChange={handleItemChange}
                        className="h-4 w-4 rounded"
                      />
                      <label className="text-xs font-medium">Ambas Caras</label>
                    </div>
                  )}
                </div>
                <div className="col-span-1 border-t pt-4 md:border-none md:pt-0">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isLaminadoBrillanteSelected"
                      checked={currentItem.isLaminadoBrillanteSelected}
                      onChange={handleItemChange}
                      className="h-5 w-5 rounded"
                    />
                    <label className="text-sm font-bold">
                      Laminado Brillante
                    </label>
                  </div>
                  {currentItem.isLaminadoBrillanteSelected && (
                    <div className="flex items-center space-x-3 mt-2 ml-8">
                      <input
                        type="checkbox"
                        name="isLaminadoBrillanteTiroRetiro"
                        checked={currentItem.isLaminadoBrillanteTiroRetiro}
                        onChange={handleItemChange}
                        className="h-4 w-4 rounded"
                      />
                      <label className="text-xs font-medium">Ambas Caras</label>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isSignadoSelected"
                    checked={currentItem.isSignadoSelected}
                    onChange={handleItemChange}
                    className="h-5 w-5 rounded"
                    disabled={
                      currentItem.printingAreaOption === "quarter_sheet_digital"
                    }
                  />
                  <label
                    className={`text-sm font-bold ${
                      currentItem.printingAreaOption ===
                        "quarter_sheet_digital" && "text-gray-400"
                    }`}
                  >
                    Signado
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isTroqueladoSelected"
                    checked={currentItem.isTroqueladoSelected}
                    onChange={handleItemChange}
                    className="h-5 w-5 rounded"
                    disabled={
                      currentItem.printingAreaOption === "quarter_sheet_digital"
                    }
                  />
                  <label
                    className={`text-sm font-bold ${
                      currentItem.printingAreaOption ===
                        "quarter_sheet_digital" && "text-gray-400"
                    }`}
                  >
                    Troquelado
                  </label>
                </div>
                <div className="flex items-center space-x-3 col-span-2 pt-2">
                  <label className="text-sm font-bold w-1/3">
                    Costo Troquel (fijo)
                  </label>
                  <input
                    type="number"
                    name="troquelPrice"
                    value={currentItem.troquelPrice}
                    onChange={handleItemChange}
                    className="shadow-sm appearance-none border rounded-lg w-2/3 py-2 px-3 text-gray-700"
                    placeholder="Precio del troquel"
                  />
                </div>
              </div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg text-center mt-4">
              <p className="font-semibold text-blue-800">
                Total para este Item:
              </p>
              <span className="text-blue-800 text-3xl font-extrabold">
                ${currentItemResult.totalGeneral.toFixed(2)}
              </span>
            </div>
            <LayoutSketch
              layoutInfo={layoutInfo}
              isWorkAndTurn={
                currentItem.isWorkAndTurn && currentItem.isTiroRetiro
              }
            />
            {layoutInfo &&
              layoutInfo.additionalYields &&
              Object.keys(layoutInfo.additionalYields).length > 0 &&
              currentItemResult.requiredFullSheets > 0 && (
                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="text-lg font-bold text-orange-800 mb-3 text-center">
                    Producción Total de Piezas Adicionales
                  </h4>
                  <div className="text-sm text-orange-700 space-y-2">
                    <p className="text-xs text-center mb-3">
                      Basado en un total de{" "}
                      <strong>{currentItemResult.requiredFullSheets}</strong>{" "}
                      pliegos necesarios para la pieza principal.
                    </p>
                    {Object.entries(layoutInfo.additionalYields).map(
                      ([id, data]) => {
                        const requestedQty =
                          currentItem.additionalPieces.find((p) => p.id === id)
                            ?.quantity || 0;
                        const totalPossibleQty =
                          data.countPerSheet *
                          currentItemResult.requiredFullSheets;
                        const canFulfill = totalPossibleQty >= requestedQty;

                        return (
                          <div
                            key={id}
                            className={`p-3 rounded-md ${
                              canFulfill ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            <p className="font-semibold">{data.name}:</p>
                            <p>
                              Solicitaste: <strong>{requestedQty}</strong>{" "}
                              piezas.
                            </p>
                            <p>
                              Se pueden producir hasta:{" "}
                              <strong>{totalPossibleQty}</strong> piezas.
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            {currentItem.isTroqueladoSelected && (
              <TroquelLayoutSketch layoutInfo={troquelLayoutInfo} />
            )}
            <button
              onClick={handleAddItemOrUpdate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              {editingItemId ? "Actualizar Item" : "Añadir Item al Presupuesto"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-100 p-6 rounded-xl shadow-inner mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Items del Presupuesto
              </h3>
              {items.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Aún no hay items en este presupuesto.
                </p>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">
                          {item.quotationName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.totalPieces} piezas - $
                          {item.totalGeneral.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setBreakdownModalItem(item)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-md text-sm transition-transform transform hover:scale-110"
                        >
                          ...
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-transform transform hover:scale-110"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-transform transform hover:scale-110"
                        >
                          X
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-6 bg-gray-100 p-6 rounded-xl shadow-inner">
              <h3 className="text-2xl font-bold text-green-700 mb-4">
                Resultados Globales
              </h3>
              <div className="info-box bg-indigo-100 p-4 rounded-lg">
                <p className="font-semibold">Total General:</p>
                <span className="text-indigo-800 text-4xl font-extrabold">
                  ${grandTotals.totalGeneral.toFixed(2)}
                </span>
              </div>
              <div className="info-box bg-teal-100 p-4 rounded-lg mt-4">
                <p className="font-semibold">
                  Total en Bs. (Tasa {bcvRate.toFixed(2)}):
                </p>
                <span className="text-teal-800 text-4xl font-extrabold">
                  Bs. {grandTotals.totalCostInBs.toFixed(2)}
                </span>
              </div>
              <div className="flex space-x-4 mt-6">
                {editingQuotationId ? (
                  <>
                    <button
                      onClick={handleUpdateQuotation}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md"
                    >
                      Actualizar Presupuesto
                    </button>
                    <button
                      onClick={resetQuotation}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-md"
                    >
                      Cancelar Edición
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSaveQuotation}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md"
                  >
                    Guardar Presupuesto
                  </button>
                )}
                <button
                  onClick={handleShowPreview}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md"
                >
                  Vista Previa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationCalculator;
