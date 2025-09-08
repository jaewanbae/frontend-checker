import { useState, useCallback } from 'react';
import { Piece, Position, Board, GameStatus } from '../types/game.types';
import { getValidMovesForPiece } from '../utils/moveValidation';

interface UseDragAndDropProps {
  board: Board;
  currentPlayer: string;
  gameStatus: string;
  onPieceSelect?: (piece: Piece) => void;
}

export const useDragAndDrop = ({
  board,
  currentPlayer,
  gameStatus,
  onPieceSelect,
}: UseDragAndDropProps) => {
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const [validDropPositions, setValidDropPositions] = useState<Position[]>([]);

  const onDragStart = useCallback(
    (piece: Piece) => {
      // Only allow dragging if it's the current player's piece and game is playing
      if (piece.color !== currentPlayer || gameStatus !== GameStatus.PLAYING) {
        return;
      }

      setActivePiece(piece);

      // Calculate valid drop positions for this piece
      const validMoves = getValidMovesForPiece(board, piece);
      setValidDropPositions(validMoves);

      // Select the piece in game state when dragging starts
      // This ensures that dragging a different piece changes the active piece
      if (onPieceSelect) {
        onPieceSelect(piece);
      }
    },
    [board, currentPlayer, gameStatus, onPieceSelect]
  );

  const onDragEnd = useCallback(() => {
    setActivePiece(null);
    setValidDropPositions([]);
  }, []);

  const onDrop = useCallback(
    (position: Position) => {
      if (activePiece) {
        // Check if this is a valid drop position
        const isValidDrop = validDropPositions.some(
          pos => pos.row === position.row && pos.col === position.col
        );

        if (isValidDrop) {
          // This will trigger move validation and execution
          // The actual move execution will be handled by the game logic
          console.log('Valid drop at:', position);
          return true;
        }
      }
      return false;
    },
    [activePiece, validDropPositions]
  );

  const isOverValidDropZone = useCallback(
    (position: Position) => {
      return validDropPositions.some(
        pos => pos.row === position.row && pos.col === position.col
      );
    },
    [validDropPositions]
  );

  return {
    activePiece,
    validDropPositions,
    onDragStart,
    onDragEnd,
    onDrop,
    isOverValidDropZone,
  };
};
