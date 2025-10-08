import React from "react";
import LayoutSketch from "../../../components/LayoutSketch";
import TroquelLayoutSketch from "../../../components/TroquelLayoutSketch";

/**
 * Componente wrapper para mostrar visualizaciones de layout
 */
const LayoutVisualization = ({
  layoutInfo,
  troquelLayoutInfo,
  isWorkAndTurn,
  isTroqueladoSelected,
}) => {
  return (
    <>
      {layoutInfo && (
        <LayoutSketch layoutInfo={layoutInfo} isWorkAndTurn={isWorkAndTurn} />
      )}
      {isTroqueladoSelected && troquelLayoutInfo && (
        <TroquelLayoutSketch layoutInfo={troquelLayoutInfo} />
      )}
    </>
  );
};

export default React.memo(LayoutVisualization);
