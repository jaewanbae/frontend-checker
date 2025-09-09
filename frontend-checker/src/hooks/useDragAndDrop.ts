import { useState, useCallback } from 'react';
import {
  Piece,
  Position,
  Board,
  GameStatus,
  PieceColor,
} from '../types/game.types';
import { getValidMovesForPlayer } from '../utils/moveValidation';

interface UseDragAndDropProps {
  board: Board;
  currentPlayer: PieceColor;
  gameStatus: string;
  currentJumpingPiece?: Piece | null;
  onPieceSelect?: (piece: Piece) => void;
}

export const useDragAndDrop = ({
  board,
  currentPlayer,
  gameStatus,
  currentJumpingPiece,
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

      // Get all valid moves for the current player (enforces mandatory capture rule)
      const allValidMoves = getValidMovesForPlayer(
        board,
        currentPlayer,
        currentJumpingPiece
      );

      // Filter to only moves from the selected piece
      const validMoves = allValidMoves
        .filter(move => move.piece.id === piece.id)
        .map(move => move.to);

      setValidDropPositions(validMoves);

      // Select the piece in game state when dragging starts
      // This ensures that dragging a different piece changes the active piece
      if (onPieceSelect) {
        onPieceSelect(piece);
      }
    },
    [board, currentPlayer, gameStatus, currentJumpingPiece, onPieceSelect]
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
