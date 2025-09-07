import { useState, useCallback } from 'react';
import { Piece, Position } from '../types/game.types';

export const useDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<Piece | null>(null);
  const [validDropPositions, setValidDropPositions] = useState<Position[]>([]);

  const onDragStart = useCallback((piece: Piece) => {
    setIsDragging(true);
    setDraggedPiece(piece);
    // Calculate valid drop positions based on game rules
    // This will be implemented with proper game logic
    setValidDropPositions([]);
  }, []);

  const onDragEnd = useCallback((position: Position) => {
    setIsDragging(false);
    setDraggedPiece(null);
    setValidDropPositions([]);
  }, []);

  const onDragOver = useCallback((position: Position) => {
    // Handle drag over events
    // This can be used for visual feedback during dragging
  }, []);

  const onDrop = useCallback(
    (position: Position) => {
      if (
        draggedPiece &&
        validDropPositions.some(
          p => p.row === position.row && p.col === position.col
        )
      ) {
        // Valid drop - this will trigger move validation and execution
        setIsDragging(false);
        setDraggedPiece(null);
        setValidDropPositions([]);
        return true;
      }
      return false;
    },
    [draggedPiece, validDropPositions]
  );

  return {
    isDragging,
    draggedPiece,
    validDropPositions,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
  };
};
