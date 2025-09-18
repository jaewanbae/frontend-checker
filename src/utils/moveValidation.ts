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
  canPromoteToKing,
} from './gameLogic';
import { BOARD_LAYOUT } from '../constants/gameConstants';

// Validate a single move
export const validateMove = (
  board: Board,
  piece: Piece,
  from: Position,
  to: Position
): ValidationResult => {
  // Basic validation
  if (!isOnBoard(to) || !isOnBoard(from)) {
    return { isValid: false, reason: 'Position is out of bounds' };
  }

  if (getPieceAt(board, to)) {
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

    const isKinging = canPromoteToKing(piece, to);
    return { isValid: true, isCapture: false, isKinging };
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

    const isKinging = canPromoteToKing(piece, to);

    return {
      isValid: true,
      isCapture: true,
      capturedPiece: middlePiece,
      isKinging,
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

// Get all valid moves for a player including multiple jumps
export const getValidMovesForPlayer = (
  board: Board,
  color: PieceColor,
  currentJumpingPiece?: Piece | null
): Move[] => {
  const validMoves: Move[] = [];
  const captureMoves: Move[] = [];

  // Get all pieces of the player
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const piece = board.squares[row][col];
      if (piece && piece.color === color) {
        // If we're in a jumping sequence, only allow moves from the current jumping piece
        if (currentJumpingPiece && piece.id !== currentJumpingPiece.id) {
          continue;
        }

        // First, get all jump sequences for this piece
        const jumpSequences = findJumpSequences(board, piece, piece.position);
        const sequencePositions = new Set<string>();

        // Track all positions that are part of jump sequences
        for (const sequence of jumpSequences) {
          for (const position of sequence) {
            sequencePositions.add(`${position.row},${position.col}`);
          }
        }

        // Get basic moves (excluding those that are part of sequences)
        const positions = getValidMovesForPiece(board, piece);
        for (const position of positions) {
          const positionKey = `${position.row},${position.col}`;

          // Skip if this position is part of a jump sequence
          if (sequencePositions.has(positionKey)) {
            continue;
          }

          const validation = validateMove(
            board,
            piece,
            piece.position,
            position
          );
          if (validation.isValid) {
            const move: Move = {
              from: piece.position,
              to: position,
              piece,
              capturedPiece: validation.capturedPiece,
              isKinging: validation.isKinging || false,
              isCapture: validation.isCapture || false,
              isMultipleJump: false,
            };

            if (validation.isCapture) {
              captureMoves.push(move);
            } else {
              validMoves.push(move);
            }
          }
        }

        // Add jump sequences
        for (const sequence of jumpSequences) {
          if (sequence.length > 0) {
            // For sequential jumps, we only create a move for the FIRST jump
            // The game engine will handle continuing the sequence
            const firstJumpPosition = sequence[0];

            // Validate the first jump
            const firstJumpValidation = validateMove(
              board,
              piece,
              piece.position,
              firstJumpPosition
            );

            if (firstJumpValidation.isValid && firstJumpValidation.isCapture) {
              // For sequential jumps, we don't know if kinging will occur until the sequence is complete
              // So we set isKinging to false here - it will be updated during execution
              const move = {
                from: piece.position,
                to: firstJumpPosition, // Only the first jump position
                piece,
                capturedPiece: firstJumpValidation.capturedPiece,
                isKinging: false, // Will be determined during execution
                isCapture: true,
                isMultipleJump: sequence.length > 1,
              };

              captureMoves.push(move);
            }
          }
        }
      }
    }
  }

  // If there are capture moves, only return those (mandatory capture rule)
  if (captureMoves.length > 0) {
    return captureMoves;
  }

  return validMoves;
};

// Check if a move results in kinging
export const checkKinging = (piece: Piece, to: Position): boolean => {
  if (piece.isKing) return false;

  return piece.color === PieceColor.LIGHT
    ? to.row === BOARD_LAYOUT.KING_ROW_LIGHT
    : to.row === BOARD_LAYOUT.KING_ROW_DARK;
};

// Check if a player has any valid moves
export const hasValidMoves = (
  board: Board,
  color: PieceColor,
  currentJumpingPiece?: Piece | null
): boolean => {
  return getValidMovesForPlayer(board, color, currentJumpingPiece).length > 0;
};

// Check if the game is over
export const checkGameOver = (board: Board): PieceColor | null => {
  const lightHasMoves = hasValidMoves(board, PieceColor.LIGHT);
  const darkHasMoves = hasValidMoves(board, PieceColor.DARK);

  if (!lightHasMoves) return PieceColor.DARK;
  if (!darkHasMoves) return PieceColor.LIGHT;

  return null;
};

// Find all possible jump sequences from a position
export const findJumpSequences = (
  board: Board,
  piece: Piece,
  from: Position,
  visited: Position[] = []
): Position[][] => {
  const sequences: Position[][] = [];
  const directions = getDiagonalDirections(piece);

  // Avoid infinite loops by checking if we've already visited this position
  if (visited.some(pos => pos.row === from.row && pos.col === from.col)) {
    return sequences;
  }

  const newVisited = [...visited, from];

  for (const direction of directions) {
    const jumpTo: Position = {
      row: from.row + direction.row * 2,
      col: from.col + direction.col * 2,
    };

    const middlePosition: Position = {
      row: from.row + direction.row,
      col: from.col + direction.col,
    };

    // Check if this is a valid jump
    if (isOnBoard(jumpTo) && isOnBoard(middlePosition)) {
      const middlePiece = getPieceAt(board, middlePosition);
      const destinationPiece = getPieceAt(board, jumpTo);

      if (
        middlePiece &&
        middlePiece.color !== piece.color &&
        !destinationPiece
      ) {
        // This is a valid jump
        const newPiece = { ...piece, position: jumpTo };
        const isKinging = canPromoteToKing(newPiece, jumpTo);

        if (isKinging) {
          // If kinging, this is the end of the sequence
          sequences.push([jumpTo]);
        } else {
          // Continue looking for more jumps
          // Create a simulated board state after this jump
          const simulatedBoard = { ...board };
          simulatedBoard.squares = board.squares.map(row => [...row]);

          // Remove the captured piece and move the jumping piece
          simulatedBoard.squares[middlePosition.row][middlePosition.col] = null;
          simulatedBoard.squares[from.row][from.col] = null;
          simulatedBoard.squares[jumpTo.row][jumpTo.col] = newPiece;

          const furtherJumps = findJumpSequences(
            simulatedBoard,
            newPiece,
            jumpTo,
            newVisited
          );

          if (furtherJumps.length > 0) {
            // Add this jump to the beginning of each further sequence
            furtherJumps.forEach(sequence => {
              const fullSequence = [jumpTo, ...sequence];
              sequences.push(fullSequence);
            });
          } else {
            // No further jumps possible, this is a single jump
            sequences.push([jumpTo]);
          }
        }
      }
    }
  }

  return sequences;
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
