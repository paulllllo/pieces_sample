import React, { forwardRef } from "react";

const BASE_SIZE = 400; // base display size for calculations

const PuzzlePiece = forwardRef(function PuzzlePiece(
  { id, col, row, columns, rows, imageUrl, isCompleted, imageDimensions },
  ref
) {
  // Use actual image dimensions if provided, otherwise fall back to BASE_SIZE
  const displayWidth = imageDimensions?.displayWidth || BASE_SIZE;
  const displayHeight = imageDimensions?.displayHeight || BASE_SIZE;
  
  // Calculate piece dimensions based on display size
  const pieceWidth = displayWidth / columns;
  const pieceHeight = displayHeight / rows;

  const style = {
    width: `${pieceWidth}px`,
    height: `${pieceHeight}px`,
    backgroundImage: `url(${imageUrl})`,
    // Use display dimensions for backgroundSize to match the scaled board
    backgroundSize: `${displayWidth}px ${displayHeight}px`,
    // Calculate background position based on display dimensions
    backgroundPosition: `-${col * pieceWidth}px -${row * pieceHeight}px`,
    backgroundRepeat: "no-repeat"
  };

  return (
    <div
      ref={ref}
      className={`puzzle-piece ${isCompleted ? "puzzle-piece--completed" : ""}`}
      data-piece-id={id}
      style={style}
    />
  );
});

export default PuzzlePiece;


