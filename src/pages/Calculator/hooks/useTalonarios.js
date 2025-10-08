import { useEffect } from "react";

/**
 * Hook para calcular automáticamente el total de piezas en modo talonarios
 */
export const useTalonarios = ({ currentItem, setCurrentItem }) => {
  useEffect(() => {
    if (!currentItem.isTalonarios) return;

    const { numTalonarios, sheetsPerSet, copiesPerSet } = currentItem;
    const talonarios = parseInt(numTalonarios, 10);
    const sheets = parseInt(sheetsPerSet, 10);
    const copies = parseInt(copiesPerSet, 10) || 0;

    if (!isNaN(talonarios) && !isNaN(sheets) && talonarios > 0 && sheets > 0) {
      const total = talonarios * sheets * (1 + copies);
      setCurrentItem((prev) => ({ ...prev, totalPieces: total.toString() }));
    } else {
      setCurrentItem((prev) => ({ ...prev, totalPieces: "" }));
    }
  }, [
    currentItem.isTalonarios,
    currentItem.numTalonarios,
    currentItem.sheetsPerSet,
    currentItem.copiesPerSet,
    setCurrentItem,
  ]);
};
