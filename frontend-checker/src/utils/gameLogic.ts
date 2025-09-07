import { Board, Piece, Position, PieceColor } from '../types/game.types';

// Initialize the board with pieces in starting positions
export const initializeBoard = (): Board => {
  const squares: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Place light pieces (top 3 rows)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        squares[row][col] = {
          id: `light-${row}-${col}`,
          color: 'light',
          type: 'pawn',
          position: { row, col },
          isKing: false,
        };
      }
    }
  }

  // Place dark pieces (bottom 3 rows)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        squares[row][col] = {
          id: `dark-${row}-${col}`,
          color: 'dark',
          type: 'pawn',
          position: { row, col },
          isKing: false,
        };
      }
    }
  }

  return {
    squares,
    size: 8,
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

// Count pieces by color
export const countPiecesByColor = (board: Board, color: PieceColor): number => {
  return getPiecesByColor(board, color).length;
};

// Check if a position is on the board
export const isOnBoard = (
  position: Position,
  boardSize: number = 8
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
  return (position.row + position.col) % 2 === 0;
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

  return piece.color === 'light'
    ? newPosition.row === 0
    : newPosition.row === 7;
};

// Promote a piece to king
export const promoteToKing = (piece: Piece): Piece => {
  return {
    ...piece,
    type: 'king',
    isKing: true,
  };
};

// Get all possible diagonal directions for a piece
export const getDiagonalDirections = (piece: Piece): Position[] => {
  if (piece.isKing) {
    // Kings can move in all diagonal directions
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  } else {
    // Regular pieces can only move forward
    return piece.color === 'light'
      ? [
          { row: -1, col: -1 },
          { row: -1, col: 1 },
        ]
      : [
          { row: 1, col: -1 },
          { row: 1, col: 1 },
        ];
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
  return getDistance(from, to) === 2;
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
        row: piece.position.row + direction.row * 2,
        col: piece.position.col + direction.col * 2,
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
