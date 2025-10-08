import { useState, useEffect, useCallback } from "react";
import { initialItemState, PRINTING_AREAS } from "../../../utils/constants";

/**
 * Hook para manejar el estado y lógica del formulario de item
 */
export const useItemForm = ({
  mainQuotationName,
  plateSizes,
  machineTypes,
}) => {
  const [currentItem, setCurrentItem] = useState({
    ...initialItemState,
    id: crypto.randomUUID(),
    quotationName: mainQuotationName,
  });

  const [editingItemId, setEditingItemId] = useState(null);

  // Sincronizar nombre de cotización cuando cambia
  useEffect(() => {
    if (!editingItemId) {
      setCurrentItem((prev) => ({
        ...prev,
        quotationName: mainQuotationName,
      }));
    }
  }, [mainQuotationName, editingItemId]);

  // Auto-selección de plancha y máquina según área de impresión
  useEffect(() => {
    if (
      !plateSizes.length ||
      !machineTypes.length ||
      !currentItem.printingAreaOption ||
      currentItem.printingAreaOption === "quarter_sheet_digital"
    ) {
      return;
    }

    const areaConfig = Object.values(PRINTING_AREAS).find(
      (area) => area.value === currentItem.printingAreaOption
    );

    if (!areaConfig) return;

    const plateToSelectId =
      plateSizes.find(
        (p) => p.size.toLowerCase() === areaConfig.plateSizeMatch.toLowerCase()
      )?.id || "";

    const machineToSelectId =
      machineTypes.find(
        (m) => m.name.toUpperCase() === areaConfig.machineMatch.toUpperCase()
      )?.id || "";

    setCurrentItem((prev) => ({
      ...prev,
      selectedPlateSizeId: plateToSelectId,
      selectedMachineTypeId: machineToSelectId,
    }));
  }, [currentItem.printingAreaOption, plateSizes, machineTypes]);

  // Manejo de cambios en campos del formulario
  const handleItemChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    setCurrentItem((prev) => {
      const newState = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Si se activa UV y hay área de impresión, auto-seleccionar mismo tamaño
      if (name === "isUVSelected" && checked && newState.printingAreaOption) {
        newState.uvSizeOption = newState.printingAreaOption;
      }

      // Si cambia el área de impresión y UV está activo, sincronizar tamaño UV
      if (name === "printingAreaOption" && newState.isUVSelected) {
        newState.uvSizeOption = value;
      }

      return newState;
    });
  }, []);

  // Agregar pieza adicional
  const addAdditionalPiece = useCallback(() => {
    setCurrentItem((prev) => ({
      ...prev,
      additionalPieces: [
        ...prev.additionalPieces,
        { id: crypto.randomUUID(), width: "", height: "", quantity: "" },
      ],
    }));
  }, []);

  // Remover pieza adicional
  const removeAdditionalPiece = useCallback((id) => {
    setCurrentItem((prev) => ({
      ...prev,
      additionalPieces: prev.additionalPieces.filter((p) => p.id !== id),
    }));
  }, []);

  // Actualizar pieza adicional
  const handleAdditionalPieceChange = useCallback((id, field, value) => {
    setCurrentItem((prev) => ({
      ...prev,
      additionalPieces: prev.additionalPieces.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  }, []);

  // Resetear formulario de item
  const resetItemForm = useCallback(() => {
    setCurrentItem({
      ...initialItemState,
      id: crypto.randomUUID(),
      quotationName: mainQuotationName,
    });
    setEditingItemId(null);
  }, [mainQuotationName]);

  // Cargar item para edición
  const loadItemForEdit = useCallback((item) => {
    setCurrentItem(item);
    setEditingItemId(item.id);
  }, []);

  return {
    currentItem,
    setCurrentItem,
    editingItemId,
    handleItemChange,
    addAdditionalPiece,
    removeAdditionalPiece,
    handleAdditionalPieceChange,
    resetItemForm,
    loadItemForEdit,
  };
};
