import {
  Board,
  Piece,
  Position,
  Move,
  ValidationResult,
  PieceColor,
} from '../types/game.types';
import {
  isOnBoard,
  getPieceAt,
  getDiagonalDirections,
  getMiddlePosition,
  mustCapture,
  getPiecesThatCanCapture,
} from './gameLogic';

// Validate a single move
export const validateMove = (
  board: Board,
  piece: Piece,
  from: Position,
  to: Position
): ValidationResult => {
  // Basic validation
  if (!isOnBoard(to)) {
    return { isValid: false, reason: 'Position is out of bounds' };
  }

  if (!isOnBoard(from)) {
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

  // Check if it's a valid distance
  if (rowDiff === 0) {
    return { isValid: false, reason: 'Must move to a different square' };
  }

  if (rowDiff > 2) {
    return { isValid: false, reason: 'Cannot move more than 2 squares' };
  }

  // Check if it's a normal move (1 square)
  if (rowDiff === 1) {
    // Check if piece can move in this direction
    const directions = getDiagonalDirections(piece);
    const isValidDirection = directions.some(
      direction =>
        from.row + direction.row === to.row &&
        from.col + direction.col === to.col
    );

    if (!isValidDirection) {
      return { isValid: false, reason: 'Invalid direction for this piece' };
    }

    return { isValid: true };
  }

  // Check if it's a capture move (2 squares)
  if (rowDiff === 2) {
    const middlePosition = getMiddlePosition(from, to);
    const middlePiece = getPieceAt(board, middlePosition);

    if (!middlePiece) {
      return { isValid: false, reason: 'No piece to capture' };
    }

    if (middlePiece.color === piece.color) {
      return { isValid: false, reason: 'Cannot capture your own piece' };
    }

    return {
      isValid: true,
      isCapture: true,
      capturedPiece: middlePiece,
    };
  }

  return { isValid: false, reason: 'Invalid move' };
};

// Get all valid moves for a piece
export const getValidMovesForPiece = (
  board: Board,
  piece: Piece
): Position[] => {
  const validMoves: Position[] = [];
  const directions = getDiagonalDirections(piece);

  // Check if player must capture
  const mustCapturePieces = getPiecesThatCanCapture(board, piece.color);
  const canThisPieceCapture = mustCapturePieces.some(p => p.id === piece.id);

  for (const direction of directions) {
    // Check normal move (1 square)
    if (!mustCapture(board, piece.color) || !canThisPieceCapture) {
      const normalMove: Position = {
        row: piece.position.row + direction.row,
        col: piece.position.col + direction.col,
      };

      const validation = validateMove(board, piece, piece.position, normalMove);
      if (validation.isValid && !validation.isCapture) {
        validMoves.push(normalMove);
      }
    }

    // Check capture move (2 squares)
    const captureMove: Position = {
      row: piece.position.row + direction.row * 2,
      col: piece.position.col + direction.col * 2,
    };

    const validation = validateMove(board, piece, piece.position, captureMove);
    if (validation.isValid && validation.isCapture) {
      validMoves.push(captureMove);
    }
  }

  return validMoves;
};

// Get all valid moves for a player
export const getValidMovesForPlayer = (
  board: Board,
  color: PieceColor
): Move[] => {
  const validMoves: Move[] = [];

  // Get all pieces of the player
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const piece = board.squares[row][col];
      if (piece && piece.color === color) {
        const positions = getValidMovesForPiece(board, piece);
        for (const position of positions) {
          const validation = validateMove(
            board,
            piece,
            piece.position,
            position
          );
          if (validation.isValid) {
            validMoves.push({
              from: piece.position,
              to: position,
              piece,
              capturedPiece: validation.capturedPiece,
              isKinging: false, // Will be determined later
              isCapture: validation.isCapture || false,
              isMultipleJump: false, // Will be determined by game logic
            });
          }
        }
      }
    }
  }

  return validMoves;
};

// Check if a move results in kinging
export const checkKinging = (piece: Piece, to: Position): boolean => {
  if (piece.isKing) return false;

  return piece.color === 'light' ? to.row === 0 : to.row === 7;
};

// Check if a player has any valid moves
export const hasValidMoves = (board: Board, color: PieceColor): boolean => {
  return getValidMovesForPlayer(board, color).length > 0;
};

// Check if the game is over
export const checkGameOver = (board: Board): PieceColor | null => {
  const lightHasMoves = hasValidMoves(board, PieceColor.LIGHT);
  const darkHasMoves = hasValidMoves(board, PieceColor.DARK);

  if (!lightHasMoves) return PieceColor.DARK;
  if (!darkHasMoves) return PieceColor.LIGHT;

  return null;
};

// Check if a move is a multiple jump (for future implementation)
export const isMultipleJump = (
  board: Board,
  piece: Piece,
  to: Position
): boolean => {
  // This will be implemented when we add support for multiple jumps
  // For now, we'll return false
  return false;
};

// Validate a complete move sequence
export const validateMoveSequence = (
  board: Board,
  moves: Move[]
): ValidationResult => {
  if (moves.length === 0) {
    return { isValid: false, reason: 'No moves provided' };
  }

  // Validate each move in the sequence
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const validation = validateMove(board, move.piece, move.from, move.to);

    if (!validation.isValid) {
      return validation;
    }
  }

  return { isValid: true };
};

// Get the best capture move (for AI)
export const getBestCaptureMove = (
  board: Board,
  color: PieceColor
): Move | null => {
  const captureMoves = getValidMovesForPlayer(board, color).filter(
    move => move.isCapture
  );

  if (captureMoves.length === 0) {
    return null;
  }

  // For now, return the first capture move
  // This can be enhanced with more sophisticated AI logic
  return captureMoves[0];
};
