import {
  validateMove,
  getValidMovesForPiece,
  getValidMovesForPlayer,
  checkKinging,
  hasValidMoves,
  checkGameOver,
  findJumpSequences,
  getBestCaptureMove,
} from '../../utils/moveValidation';
import {
  initializeBoard,
  setPieceAt,
  getPieceAt,
  removePiece,
} from '../../utils/gameLogic';
import {
  Board,
  Piece,
  Position,
  PieceColor,
  GameState,
  Move,
} from '../../types/game.types';
import { PieceType, GameStatus, GameResult } from '../../constants/gameEnums';
import { BOARD_LAYOUT } from '../../constants/gameConstants';

describe('Move Validation', () => {
  let board: Board;
  let gameState: GameState;

  beforeEach(() => {
    board = initializeBoard();
    gameState = {
      board,
      currentPlayer: PieceColor.LIGHT,
      players: {
        light: {
          color: PieceColor.LIGHT,
          isAI: false,
          piecesRemaining: 12,
          captures: 0,
          isActive: true,
        },
        dark: {
          color: PieceColor.DARK,
          isAI: false,
          piecesRemaining: 12,
          captures: 0,
          isActive: false,
        },
      },
      gameMode: 'human-vs-human' as any,
      gameStatus: GameStatus.PLAYING,
      gameResult: GameResult.NONE,
      stats: {
        moveCount: 0,
        gameTime: 0,
        captures: {
          light: 0,
          dark: 0,
        },
      },
      moveHistory: [],
      selectedPiece: null,
      validMoves: [],
      highlightedSquares: [],
      currentJumpingPiece: null,
    };
  });

  describe('validateMove', () => {
    test('should validate normal diagonal move', () => {
      const piece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const from = { row: 2, col: 2 };
      const to = { row: 3, col: 3 };

      const result = validateMove(board, piece, from, to);
      expect(result.isValid).toBe(true);
      expect(result.isCapture).toBe(false);
      expect(result.isKinging).toBe(false);
    });

    test('should validate capture move', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece);
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece);

      const from = { row: 2, col: 2 };
      const to = { row: 4, col: 4 };

      const result = validateMove(testBoard2, lightPiece, from, to);
      expect(result.isValid).toBe(true);
      expect(result.isCapture).toBe(true);
      expect(result.capturedPiece).toEqual(darkPiece);
    });

    test('should reject move to occupied square', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece);
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece);

      const from = { row: 2, col: 2 };
      const to = { row: 3, col: 3 };

      const result = validateMove(testBoard2, lightPiece, from, to);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Destination is occupied');
    });

    test('should reject non-diagonal move', () => {
      const piece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const from = { row: 2, col: 2 };
      const to = { row: 2, col: 4 };

      const result = validateMove(board, piece, from, to);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Must move diagonally');
    });

    test('should reject move more than 2 squares', () => {
      const piece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const from = { row: 2, col: 2 };
      const to = { row: 5, col: 5 };

      const result = validateMove(board, piece, from, to);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Cannot move more than 2 squares');
    });

    test('should reject backward move for pawn', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const from = { row: 3, col: 3 };
      const to = { row: 2, col: 2 };

      const result = validateMove(board, lightPiece, from, to);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Invalid direction for this piece');
    });

    test('should allow backward move for king', () => {
      const king: Piece = {
        id: 'king',
        color: PieceColor.LIGHT,
        type: PieceType.KING,
        position: { row: 3, col: 3 },
        isKing: true,
      };

      const from = { row: 3, col: 3 };
      const to = { row: 2, col: 2 };

      const result = validateMove(board, king, from, to);
      expect(result.isValid).toBe(true);
    });

    test('should reject capture of own piece', () => {
      const lightPiece1: Piece = {
        id: 'light-piece-1',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const lightPiece2: Piece = {
        id: 'light-piece-2',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece1);
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, lightPiece2);

      const from = { row: 2, col: 2 };
      const to = { row: 4, col: 4 };

      const result = validateMove(testBoard2, lightPiece1, from, to);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Cannot capture your own piece');
    });

    test('should reject capture without piece to capture', () => {
      const piece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const from = { row: 2, col: 2 };
      const to = { row: 4, col: 4 };

      const result = validateMove(board, piece, from, to);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('No piece to capture');
    });

    test('should detect kinging for light piece', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 6, col: 1 },
        isKing: false,
      };

      // Use empty board to avoid conflicts
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const testBoard = setPieceAt(emptyBoard, { row: 6, col: 1 }, lightPiece);
      const from = { row: 6, col: 1 };
      const to = { row: BOARD_LAYOUT.KING_ROW_LIGHT, col: 2 }; // Move diagonally

      const result = validateMove(testBoard, lightPiece, from, to);
      expect(result.isValid).toBe(true);
      expect(result.isKinging).toBe(true);
    });

    test('should detect kinging for dark piece', () => {
      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      // Use empty board to avoid conflicts
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const testBoard = setPieceAt(emptyBoard, { row: 1, col: 1 }, darkPiece);
      const from = { row: 1, col: 1 };
      const to = { row: BOARD_LAYOUT.KING_ROW_DARK, col: 0 }; // Move diagonally

      const result = validateMove(testBoard, darkPiece, from, to);
      expect(result.isValid).toBe(true);
      expect(result.isKinging).toBe(true);
    });
  });

  describe('getValidMovesForPiece', () => {
    test('should return valid moves for piece', () => {
      const piece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, piece);
      const validMoves = getValidMovesForPiece(testBoard, piece);

      expect(validMoves.length).toBeGreaterThan(0);
      validMoves.forEach(move => {
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(8);
        expect(move.col).toBeGreaterThanOrEqual(0);
        expect(move.col).toBeLessThan(8);
      });
    });

    test('should prioritize capture moves when available', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece);
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece);

      const validMoves = getValidMovesForPiece(testBoard2, lightPiece);
      expect(validMoves.length).toBeGreaterThan(0);

      // Should include the capture move
      const captureMove = validMoves.find(
        move => move.row === 4 && move.col === 4
      );
      expect(captureMove).toBeDefined();
    });
  });

  describe('getValidMovesForPlayer', () => {
    test('should return moves for all player pieces', () => {
      const validMoves = getValidMovesForPlayer(board, PieceColor.LIGHT);
      expect(validMoves.length).toBeGreaterThan(0);

      validMoves.forEach(move => {
        expect(move.piece.color).toBe(PieceColor.LIGHT);
      });
    });

    test('should only return capture moves when captures are mandatory', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece);
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece);

      const validMoves = getValidMovesForPlayer(testBoard2, PieceColor.LIGHT);

      validMoves.forEach(move => {
        expect(move.isCapture).toBe(true);
      });
    });

    test('should return regular moves when no captures available', () => {
      const validMoves = getValidMovesForPlayer(board, PieceColor.LIGHT);

      if (validMoves.length > 0) {
        validMoves.forEach(move => {
          expect(move.isCapture).toBe(false);
        });
      }
    });

    test('should respect current jumping piece constraint', () => {
      const jumpingPiece: Piece = {
        id: 'jumping-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const otherPiece: Piece = {
        id: 'other-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, jumpingPiece);
      const testBoard2 = setPieceAt(testBoard, { row: 1, col: 1 }, otherPiece);

      const validMoves = getValidMovesForPlayer(
        testBoard2,
        PieceColor.LIGHT,
        jumpingPiece
      );

      validMoves.forEach(move => {
        expect(move.piece.id).toBe('jumping-piece');
      });
    });
  });

  describe('checkKinging', () => {
    test('should return true for light piece reaching king row', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 6, col: 1 },
        isKing: false,
      };

      const kingPosition = { row: BOARD_LAYOUT.KING_ROW_LIGHT, col: 1 };
      expect(checkKinging(lightPiece, kingPosition)).toBe(true);
    });

    test('should return true for dark piece reaching king row', () => {
      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      const kingPosition = { row: BOARD_LAYOUT.KING_ROW_DARK, col: 1 };
      expect(checkKinging(darkPiece, kingPosition)).toBe(true);
    });

    test('should return false for piece not reaching king row', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 6, col: 1 },
        isKing: false,
      };

      const nonKingPosition = { row: 5, col: 1 };
      expect(checkKinging(lightPiece, nonKingPosition)).toBe(false);
    });

    test('should return false for already kinged piece', () => {
      const kingPiece: Piece = {
        id: 'king-piece',
        color: PieceColor.LIGHT,
        type: PieceType.KING,
        position: { row: 6, col: 1 },
        isKing: true,
      };

      const kingPosition = { row: BOARD_LAYOUT.KING_ROW_LIGHT, col: 1 };
      expect(checkKinging(kingPiece, kingPosition)).toBe(false);
    });
  });

  describe('hasValidMoves', () => {
    test('should return true when player has valid moves', () => {
      expect(hasValidMoves(board, PieceColor.LIGHT)).toBe(true);
    });

    test('should return false when player has no valid moves', () => {
      // Create a board with only one piece that can't move
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const trappedPiece: Piece = {
        id: 'trapped-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 0, col: 0 },
        isKing: false,
      };

      // Block all possible moves by placing pieces at (1,1) and (2,2)
      const blockingPiece1: Piece = {
        id: 'blocking-piece-1',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      const blockingPiece2: Piece = {
        id: 'blocking-piece-2',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      let testBoard = setPieceAt(emptyBoard, { row: 0, col: 0 }, trappedPiece);
      testBoard = setPieceAt(testBoard, { row: 1, col: 1 }, blockingPiece1);
      testBoard = setPieceAt(testBoard, { row: 2, col: 2 }, blockingPiece2);

      expect(hasValidMoves(testBoard, PieceColor.LIGHT)).toBe(false);
    });
  });

  describe('checkGameOver', () => {
    test('should return null when both players have moves', () => {
      expect(checkGameOver(board)).toBeNull();
    });

    test('should return winner when one player has no moves', () => {
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      // Only light piece, no moves available
      const trappedPiece: Piece = {
        id: 'trapped-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 0, col: 0 },
        isKing: false,
      };

      // Block all possible moves by placing pieces at (1,1) and (2,2)
      const blockingPiece1: Piece = {
        id: 'blocking-piece-1',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      const blockingPiece2: Piece = {
        id: 'blocking-piece-2',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      let testBoard = setPieceAt(emptyBoard, { row: 0, col: 0 }, trappedPiece);
      testBoard = setPieceAt(testBoard, { row: 1, col: 1 }, blockingPiece1);
      testBoard = setPieceAt(testBoard, { row: 2, col: 2 }, blockingPiece2);
      expect(checkGameOver(testBoard)).toBe(PieceColor.DARK);
    });
  });

  describe('findJumpSequences', () => {
    test('should find single jump sequence', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece);
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece);

      const sequences = findJumpSequences(testBoard2, lightPiece, {
        row: 2,
        col: 2,
      });
      expect(sequences.length).toBeGreaterThan(0);
      expect(sequences[0]).toEqual([{ row: 4, col: 4 }]);
    });

    test('should find multiple jump sequences', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const darkPiece1: Piece = {
        id: 'dark-piece-1',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const darkPiece2: Piece = {
        id: 'dark-piece-2',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 5, col: 5 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece);
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece1);
      const testBoard3 = setPieceAt(testBoard2, { row: 5, col: 5 }, darkPiece2);

      const sequences = findJumpSequences(testBoard3, lightPiece, {
        row: 2,
        col: 2,
      });
      expect(sequences.length).toBeGreaterThan(0);

      // Should find sequences that include multiple jumps
      const multiJumpSequences = sequences.filter(seq => seq.length > 1);
      expect(multiJumpSequences.length).toBeGreaterThan(0);
    });

    test('should return empty array when no jumps available', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece);
      const sequences = findJumpSequences(testBoard, lightPiece, {
        row: 2,
        col: 2,
      });
      expect(sequences).toHaveLength(0);
    });
  });

  describe('getBestCaptureMove', () => {
    test('should return capture move when available', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const testBoard = setPieceAt(board, { row: 2, col: 2 }, lightPiece);
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece);

      const bestMove = getBestCaptureMove(testBoard2, PieceColor.LIGHT);
      expect(bestMove).toBeDefined();
      expect(bestMove?.isCapture).toBe(true);
    });

    test('should return null when no captures available', () => {
      const bestMove = getBestCaptureMove(board, PieceColor.LIGHT);
      expect(bestMove).toBeNull();
    });
  });
});
