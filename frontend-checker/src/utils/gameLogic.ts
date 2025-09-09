import { Board, Piece, Position, PieceColor } from '../types/game.types';
import {
  GAME_CONFIG,
  BOARD_LAYOUT,
  GAME_RULES,
  MOVEMENT,
} from '../constants/gameConstants';
import { PieceType } from '../constants/gameEnums';

// Helper function to create a piece
const createPiece = (color: PieceColor, row: number, col: number): Piece => ({
  id: `${color}-${row}-${col}`,
  color,
  type: PieceType.PAWN,
  position: { row, col },
  isKing: false,
});

// Helper function to place pieces for a color
const placePiecesForColor = (
  squares: (Piece | null)[][],
  color: PieceColor,
  startRow: number,
  endRow: number
): void => {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
      if ((row + col) % 2 === BOARD_LAYOUT.DARK_SQUARE_PATTERN) {
        squares[row][col] = createPiece(color, row, col);
      }
    }
  }
};

// Initialize the board with pieces in starting positions
export const initializeBoard = (): Board => {
  const squares: (Piece | null)[][] = Array(GAME_CONFIG.BOARD_SIZE)
    .fill(null)
    .map(() => Array(GAME_CONFIG.BOARD_SIZE).fill(null));

  placePiecesForColor(
    squares,
    PieceColor.LIGHT,
    BOARD_LAYOUT.LIGHT_PIECE_START_ROW,
    BOARD_LAYOUT.LIGHT_PIECE_END_ROW
  );
  placePiecesForColor(
    squares,
    PieceColor.DARK,
    BOARD_LAYOUT.DARK_PIECE_START_ROW,
    BOARD_LAYOUT.DARK_PIECE_END_ROW
  );

  return {
    squares,
    size: GAME_CONFIG.BOARD_SIZE,
  };
};

// Get all pieces of a specific color
export const getPiecesByColor = (board: Board, color: PieceColor): Piece[] => {
  const pieces: Piece[] = [];

  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const piece = board.squares[row][col];
      if (piece && piece.color === color) {
        pieces.push(piece);
      }
    }
  }

  return pieces;
};

// Check if a position is on the board
export const isOnBoard = (
  position: Position,
  boardSize: number = GAME_CONFIG.BOARD_SIZE
): boolean => {
  return (
    position.row >= 0 &&
    position.row < boardSize &&
    position.col >= 0 &&
    position.col < boardSize
  );
};

// Check if a square is light or dark
export const isLightSquare = (position: Position): boolean => {
  return (
    (position.row + position.col) % 2 === BOARD_LAYOUT.LIGHT_SQUARE_PATTERN
  );
};

// Get the piece at a specific position
export const getPieceAt = (board: Board, position: Position): Piece | null => {
  if (!isOnBoard(position, board.size)) {
    return null;
  }
  return board.squares[position.row][position.col];
};

// Set a piece at a specific position
export const setPieceAt = (
  board: Board,
  position: Position,
  piece: Piece | null
): Board => {
  if (!isOnBoard(position, board.size)) {
    return board;
  }

  const newSquares = board.squares.map(row => [...row]);
  newSquares[position.row][position.col] = piece;

  return {
    ...board,
    squares: newSquares,
  };
};

// Move a piece from one position to another
export const movePiece = (
  board: Board,
  from: Position,
  to: Position
): Board => {
  const piece = getPieceAt(board, from);
  if (!piece) {
    return board;
  }

  // Remove piece from original position
  let newBoard = setPieceAt(board, from, null);

  // Update piece position and place at new position
  const updatedPiece = { ...piece, position: to };
  newBoard = setPieceAt(newBoard, to, updatedPiece);

  return newBoard;
};

// Remove a piece from the board
export const removePiece = (board: Board, position: Position): Board => {
  return setPieceAt(board, position, null);
};

// Check if a piece can be promoted to king
export const canPromoteToKing = (
  piece: Piece,
  newPosition: Position
): boolean => {
  if (piece.isKing) return false;

  return piece.color === PieceColor.LIGHT
    ? newPosition.row === BOARD_LAYOUT.KING_ROW_LIGHT
    : newPosition.row === BOARD_LAYOUT.KING_ROW_DARK;
};

// Promote a piece to king
export const promoteToKing = (piece: Piece): Piece => {
  return {
    ...piece,
    type: PieceType.KING,
    isKing: true,
  };
};

// Get all possible diagonal directions for a piece
export const getDiagonalDirections = (piece: Piece): Position[] => {
  if (piece.isKing) {
    // Kings can move in all diagonal directions
    return MOVEMENT.DIAGONAL_DIRECTIONS;
  } else {
    // Regular pieces can only move forward
    return piece.color === PieceColor.LIGHT
      ? MOVEMENT.LIGHT_PIECE_DIRECTIONS
      : MOVEMENT.DARK_PIECE_DIRECTIONS;
  }
};

// Calculate the distance between two positions
export const getDistance = (from: Position, to: Position): number => {
  return Math.abs(to.row - from.row) + Math.abs(to.col - from.col);
};

// Check if two positions are equal
export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col;
};

// Get the middle position between two positions
export const getMiddlePosition = (from: Position, to: Position): Position => {
  return {
    row: (from.row + to.row) / 2,
    col: (from.col + to.col) / 2,
  };
};

// Check if a move is a capture move
export const isCaptureMove = (from: Position, to: Position): boolean => {
  return getDistance(from, to) === GAME_RULES.CAPTURE_DISTANCE;
};

// Get all pieces that can capture
export const getPiecesThatCanCapture = (
  board: Board,
  color: PieceColor
): Piece[] => {
  const pieces = getPiecesByColor(board, color);
  return pieces.filter(piece => {
    const directions = getDiagonalDirections(piece);
    return directions.some(direction => {
      const capturePosition: Position = {
        row: piece.position.row + direction.row * GAME_RULES.CAPTURE_DISTANCE,
        col: piece.position.col + direction.col * GAME_RULES.CAPTURE_DISTANCE,
      };

      if (!isOnBoard(capturePosition)) return false;

      const middlePosition = getMiddlePosition(piece.position, capturePosition);
      const middlePiece = getPieceAt(board, middlePosition);
      const destinationPiece = getPieceAt(board, capturePosition);

      return middlePiece && middlePiece.color !== color && !destinationPiece;
    });
  });
};

// Check if a player must capture (mandatory capture rule)
export const mustCapture = (board: Board, color: PieceColor): boolean => {
  return getPiecesThatCanCapture(board, color).length > 0;
};
