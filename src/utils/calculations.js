/**
 * Calculate the best fit for pieces on a sheet
 * @param {number} pieceW - Piece width
 * @param {number} pieceH - Piece height
 * @param {number} sheetW - Sheet width
 * @param {number} sheetH - Sheet height
 * @param {number} separation - Separation between pieces
 * @returns {object} Fit information
 */
export const calculateBestFit = (
  pieceW,
  pieceH,
  sheetW,
  sheetH,
  separation = 0
) => {
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

/**
 * Calculate troquel fit
 */
export const calculateTroquelFit = (
  pieceW,
  pieceH,
  sheetW,
  sheetH,
  separation
) => {
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

  const cols1 = Math.floor((sheetW + separation) / effPieceW);
  const rows1 = Math.floor((sheetH + separation) / effPieceH);

  const cols2 = Math.floor((sheetW + separation) / effPieceH);
  const rows2 = Math.floor((sheetH + separation) / effPieceW);

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
