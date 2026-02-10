import React, { forwardRef } from "react";

const BASE_SIZE = 400; // base image assumed 400x400px for math

const PuzzlePiece = forwardRef(function PuzzlePiece(
  { id, col, row, columns, rows, imageUrl, isCompleted },
  ref
) {
  const pieceWidth = BASE_SIZE / columns;
  const pieceHeight = BASE_SIZE / rows;

  const style = {
    width: `${pieceWidth}px`,
    height: `${pieceHeight}px`,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${BASE_SIZE}px ${BASE_SIZE}px`,
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


