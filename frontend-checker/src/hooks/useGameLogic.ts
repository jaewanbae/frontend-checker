import { useCallback } from 'react';
import {
  Piece,
  Position,
  Move,
  Board,
  PieceColor,
  ValidationResult,
} from '../types/game.types';
import { MOVEMENT } from '../constants/gameConstants';

export const useGameLogic = () => {
  // Check if a position is within board bounds
  const isValidPosition = useCallback(
    (position: Position, boardSize: number = 8): boolean => {
      return (
        position.row >= 0 &&
        position.row < boardSize &&
        position.col >= 0 &&
        position.col < boardSize
      );
    },
    []
  );

  // Check if a square is light or dark
  const isLightSquare = useCallback((position: Position): boolean => {
    return (position.row + position.col) % 2 === 0;
  }, []);

  // Get piece at a specific position
  const getPieceAt = useCallback(
    (board: Board, position: Position): Piece | null => {
      if (!isValidPosition(position, board.size)) {
        return null;
      }
      return board.squares[position.row][position.col];
    },
    [isValidPosition]
  );

  // Check if a move is valid for a piece
  const isValidMove = useCallback(
    (
      board: Board,
      piece: Piece,
      from: Position,
      to: Position
    ): ValidationResult => {
      // Basic validation
      if (!isValidPosition(to, board.size)) {
        return { isValid: false, reason: 'Position is out of bounds' };
      }

      if (!isValidPosition(from, board.size)) {
        return { isValid: false, reason: 'From position is out of bounds' };
      }

      // Check if destination is empty
      const destinationPiece = getPieceAt(board, to);
      if (destinationPiece) {
        return { isValid: false, reason: 'Destination is occupied' };
      }

      // Check if it's a diagonal move
      const rowDiff = Math.abs(to.row - from.row);
      const colDiff = Math.abs(to.col - from.col);

      if (rowDiff !== colDiff) {
        return { isValid: false, reason: 'Must move diagonally' };
      }

      // Check if it's a valid distance (1 for normal moves, 2 for captures)
      if (rowDiff === 1) {
        // Normal move - check direction for non-kings
        if (!piece.isKing) {
          const isMovingForward =
            piece.color === 'light' ? to.row < from.row : to.row > from.row;
          if (!isMovingForward) {
            return { isValid: false, reason: 'Pieces can only move forward' };
          }
        }
        return { isValid: true };
      } else if (rowDiff === 2) {
        // Capture move - check if there's an opponent piece to capture
        const middleRow = (from.row + to.row) / 2;
        const middleCol = (from.col + to.col) / 2;
        const middlePiece = getPieceAt(board, {
          row: middleRow,
          col: middleCol,
        });

        if (!middlePiece || middlePiece.color === piece.color) {
          return { isValid: false, reason: 'No opponent piece to capture' };
        }

        return {
          isValid: true,
          isCapture: true,
          capturedPiece: middlePiece,
        };
      }

      return { isValid: false, reason: 'Invalid move distance' };
    },
    [isValidPosition, getPieceAt]
  );

  // Get all valid moves for a piece
  const getValidMoves = useCallback(
    (board: Board, piece: Piece): Position[] => {
      const validMoves: Position[] = [];
      const directions = piece.isKing
        ? MOVEMENT.DIAGONAL_DIRECTIONS
        : piece.color === 'light'
          ? MOVEMENT.LIGHT_PIECE_DIRECTIONS
          : MOVEMENT.DARK_PIECE_DIRECTIONS;

      // Check normal moves
      for (const direction of directions) {
        const newPosition: Position = {
          row: piece.position.row + direction.row,
          col: piece.position.col + direction.col,
        };

        const validation = isValidMove(
          board,
          piece,
          piece.position,
          newPosition
        );
        if (validation.isValid && !validation.isCapture) {
          validMoves.push(newPosition);
        }
      }

      // Check capture moves
      for (const direction of directions) {
        const newPosition: Position = {
          row: piece.position.row + direction.row * 2,
          col: piece.position.col + direction.col * 2,
        };

        const validation = isValidMove(
          board,
          piece,
          piece.position,
          newPosition
        );
        if (validation.isValid && validation.isCapture) {
          validMoves.push(newPosition);
        }
      }

      return validMoves;
    },
    [isValidMove]
  );

  // Check if a piece can be kinged
  const canBeKinged = useCallback(
    (piece: Piece, newPosition: Position): boolean => {
      if (piece.isKing) return false;

      return piece.color === 'light'
        ? newPosition.row === 0
        : newPosition.row === 7;
    },
    []
  );

  // Create a move object
  const createMove = useCallback(
    (
      piece: Piece,
      from: Position,
      to: Position,
      capturedPiece?: Piece
    ): Move => {
      const isCapture = !!capturedPiece;
      const isKinging = canBeKinged(piece, to);

      return {
        from,
        to,
        piece,
        capturedPiece,
        isKinging,
        isCapture,
        isMultipleJump: false, // Will be determined by game logic
      };
    },
    [canBeKinged]
  );

  // Check if a player has any valid moves
  const hasValidMoves = useCallback(
    (board: Board, playerColor: PieceColor): boolean => {
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          const piece = board.squares[row][col];
          if (piece && piece.color === playerColor) {
            const validMoves = getValidMoves(board, piece);
            if (validMoves.length > 0) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [getValidMoves]
  );

  // Check if the game is over
  const checkGameOver = useCallback(
    (board: Board): PieceColor | null => {
      const lightHasMoves = hasValidMoves(board, PieceColor.LIGHT);
      const darkHasMoves = hasValidMoves(board, PieceColor.DARK);

      if (!lightHasMoves) return PieceColor.DARK;
      if (!darkHasMoves) return PieceColor.LIGHT;

      return null;
    },
    [hasValidMoves]
  );

  return {
    isValidPosition,
    isLightSquare,
    getPieceAt,
    isValidMove,
    getValidMoves,
    canBeKinged,
    createMove,
    hasValidMoves,
    checkGameOver,
  };
};
