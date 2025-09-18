import {
  initializeBoard,
  getPiecesByColor,
  isOnBoard,
  isLightSquare,
  getPieceAt,
  setPieceAt,
  movePiece,
  removePiece,
  canPromoteToKing,
  promoteToKing,
  getDiagonalDirections,
  getDistance,
  positionsEqual,
  getMiddlePosition,
  isCaptureMove,
  getPiecesThatCanCapture,
  mustCapture,
} from '../../utils/gameLogic';
import { Board, Piece, Position, PieceColor } from '../../types/game.types';
import { PieceType } from '../../constants/gameEnums';
import {
  GAME_CONFIG,
  BOARD_LAYOUT,
  GAME_RULES,
} from '../../constants/gameConstants';

describe('Game Logic Utils', () => {
  let board: Board;

  beforeEach(() => {
    board = initializeBoard();
  });

  describe('initializeBoard', () => {
    test('should initialize board with correct number of pieces', () => {
      const lightPieces = getPiecesByColor(board, PieceColor.LIGHT);
      const darkPieces = getPiecesByColor(board, PieceColor.DARK);

      expect(lightPieces).toHaveLength(12);
      expect(darkPieces).toHaveLength(12);
    });

    test('should have correct board size', () => {
      expect(board.size).toBe(8);
      expect(board.squares).toHaveLength(8);
      expect(board.squares[0]).toHaveLength(8);
    });

    test('should place light pieces in correct rows', () => {
      const lightPieces = getPiecesByColor(board, PieceColor.LIGHT);

      lightPieces.forEach(piece => {
        expect(piece.position.row).toBeGreaterThanOrEqual(
          BOARD_LAYOUT.LIGHT_PIECE_START_ROW
        );
        expect(piece.position.row).toBeLessThanOrEqual(
          BOARD_LAYOUT.LIGHT_PIECE_END_ROW
        );
      });
    });

    test('should place dark pieces in correct rows', () => {
      const darkPieces = getPiecesByColor(board, PieceColor.DARK);

      darkPieces.forEach(piece => {
        expect(piece.position.row).toBeGreaterThanOrEqual(
          BOARD_LAYOUT.DARK_PIECE_START_ROW
        );
        expect(piece.position.row).toBeLessThanOrEqual(
          BOARD_LAYOUT.DARK_PIECE_END_ROW
        );
      });
    });

    test('should place pieces only on dark squares', () => {
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          const piece = board.squares[row][col];
          if (piece) {
            expect((row + col) % 2).toBe(BOARD_LAYOUT.DARK_SQUARE_PATTERN);
          }
        }
      }
    });
  });

  describe('getPiecesByColor', () => {
    test('should return all pieces of specified color', () => {
      const lightPieces = getPiecesByColor(board, PieceColor.LIGHT);
      const darkPieces = getPiecesByColor(board, PieceColor.DARK);

      lightPieces.forEach(piece => {
        expect(piece.color).toBe(PieceColor.LIGHT);
      });

      darkPieces.forEach(piece => {
        expect(piece.color).toBe(PieceColor.DARK);
      });
    });

    test('should return empty array for empty board', () => {
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const pieces = getPiecesByColor(emptyBoard, PieceColor.LIGHT);
      expect(pieces).toHaveLength(0);
    });
  });

  describe('isOnBoard', () => {
    test('should return true for valid positions', () => {
      expect(isOnBoard({ row: 0, col: 0 })).toBe(true);
      expect(isOnBoard({ row: 7, col: 7 })).toBe(true);
      expect(isOnBoard({ row: 4, col: 4 })).toBe(true);
    });

    test('should return false for positions outside board', () => {
      expect(isOnBoard({ row: -1, col: 0 })).toBe(false);
      expect(isOnBoard({ row: 0, col: -1 })).toBe(false);
      expect(isOnBoard({ row: 8, col: 0 })).toBe(false);
      expect(isOnBoard({ row: 0, col: 8 })).toBe(false);
      expect(isOnBoard({ row: -1, col: -1 })).toBe(false);
      expect(isOnBoard({ row: 8, col: 8 })).toBe(false);
    });

    test('should work with custom board size', () => {
      expect(isOnBoard({ row: 0, col: 0 }, 10)).toBe(true);
      expect(isOnBoard({ row: 9, col: 9 }, 10)).toBe(true);
      expect(isOnBoard({ row: 10, col: 0 }, 10)).toBe(false);
    });
  });

  describe('isLightSquare', () => {
    test('should correctly identify light squares', () => {
      expect(isLightSquare({ row: 0, col: 0 })).toBe(true);
      expect(isLightSquare({ row: 0, col: 1 })).toBe(false);
      expect(isLightSquare({ row: 1, col: 0 })).toBe(false);
      expect(isLightSquare({ row: 1, col: 1 })).toBe(true);
    });
  });

  describe('getPieceAt', () => {
    test('should return piece at valid position', () => {
      const piece = getPieceAt(board, { row: 0, col: 1 });
      expect(piece).toBeDefined();
      expect(piece?.color).toBe(PieceColor.LIGHT);
    });

    test('should return null for empty square', () => {
      const piece = getPieceAt(board, { row: 3, col: 3 });
      expect(piece).toBeNull();
    });

    test('should return null for invalid position', () => {
      const piece = getPieceAt(board, { row: -1, col: 0 });
      expect(piece).toBeNull();
    });
  });

  describe('setPieceAt', () => {
    test('should place piece at valid position', () => {
      const piece: Piece = {
        id: 'test-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const newBoard = setPieceAt(board, { row: 3, col: 3 }, piece);
      const placedPiece = getPieceAt(newBoard, { row: 3, col: 3 });

      expect(placedPiece).toEqual(piece);
    });

    test('should remove piece when setting to null', () => {
      const originalPiece = getPieceAt(board, { row: 0, col: 1 });
      expect(originalPiece).toBeDefined();

      const newBoard = setPieceAt(board, { row: 0, col: 1 }, null);
      const removedPiece = getPieceAt(newBoard, { row: 0, col: 1 });

      expect(removedPiece).toBeNull();
    });

    test('should not modify board for invalid position', () => {
      const piece: Piece = {
        id: 'test-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: -1, col: 0 },
        isKing: false,
      };

      const newBoard = setPieceAt(board, { row: -1, col: 0 }, piece);
      expect(newBoard).toBe(board); // Should return same board reference
    });
  });

  describe('movePiece', () => {
    test('should move piece from one position to another', () => {
      const from = { row: 0, col: 1 };
      const to = { row: 1, col: 2 };

      const originalPiece = getPieceAt(board, from);
      expect(originalPiece).toBeDefined();

      const newBoard = movePiece(board, from, to);
      const movedPiece = getPieceAt(newBoard, to);
      const emptyFrom = getPieceAt(newBoard, from);

      expect(movedPiece).toEqual({ ...originalPiece, position: to });
      expect(emptyFrom).toBeNull();
    });

    test('should not modify board if no piece at source', () => {
      const from = { row: 3, col: 3 };
      const to = { row: 4, col: 4 };

      const newBoard = movePiece(board, from, to);
      expect(newBoard).toBe(board); // Should return same board reference
    });
  });

  describe('removePiece', () => {
    test('should remove piece from specified position', () => {
      const position = { row: 0, col: 1 };
      const originalPiece = getPieceAt(board, position);
      expect(originalPiece).toBeDefined();

      const newBoard = removePiece(board, position);
      const removedPiece = getPieceAt(newBoard, position);

      expect(removedPiece).toBeNull();
    });
  });

  describe('canPromoteToKing', () => {
    test('should return true for light piece reaching king row', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 6, col: 1 },
        isKing: false,
      };

      const kingPosition = { row: BOARD_LAYOUT.KING_ROW_LIGHT, col: 1 };
      expect(canPromoteToKing(lightPiece, kingPosition)).toBe(true);
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
      expect(canPromoteToKing(darkPiece, kingPosition)).toBe(true);
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
      expect(canPromoteToKing(lightPiece, nonKingPosition)).toBe(false);
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
      expect(canPromoteToKing(kingPiece, kingPosition)).toBe(false);
    });
  });

  describe('promoteToKing', () => {
    test('should promote piece to king', () => {
      const piece: Piece = {
        id: 'test-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 6, col: 1 },
        isKing: false,
      };

      const kingPiece = promoteToKing(piece);

      expect(kingPiece.isKing).toBe(true);
      expect(kingPiece.type).toBe(PieceType.KING);
      expect(kingPiece.id).toBe(piece.id);
      expect(kingPiece.color).toBe(piece.color);
      expect(kingPiece.position).toEqual(piece.position);
    });
  });

  describe('getDiagonalDirections', () => {
    test('should return all directions for king', () => {
      const king: Piece = {
        id: 'king',
        color: PieceColor.LIGHT,
        type: PieceType.KING,
        position: { row: 4, col: 4 },
        isKing: true,
      };

      const directions = getDiagonalDirections(king);
      expect(directions).toHaveLength(4);
      expect(directions).toEqual([
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 },
      ]);
    });

    test('should return forward directions for light pawn', () => {
      const lightPawn: Piece = {
        id: 'light-pawn',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 4, col: 4 },
        isKing: false,
      };

      const directions = getDiagonalDirections(lightPawn);
      expect(directions).toHaveLength(2);
      expect(directions).toEqual([
        { row: 1, col: -1 },
        { row: 1, col: 1 },
      ]);
    });

    test('should return forward directions for dark pawn', () => {
      const darkPawn: Piece = {
        id: 'dark-pawn',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 4, col: 4 },
        isKing: false,
      };

      const directions = getDiagonalDirections(darkPawn);
      expect(directions).toHaveLength(2);
      expect(directions).toEqual([
        { row: -1, col: -1 },
        { row: -1, col: 1 },
      ]);
    });
  });

  describe('getDistance', () => {
    test('should calculate Manhattan distance correctly', () => {
      expect(getDistance({ row: 0, col: 0 }, { row: 3, col: 4 })).toBe(7);
      expect(getDistance({ row: 2, col: 2 }, { row: 2, col: 2 })).toBe(0);
      expect(getDistance({ row: 1, col: 1 }, { row: 3, col: 3 })).toBe(4);
    });
  });

  describe('positionsEqual', () => {
    test('should return true for equal positions', () => {
      expect(positionsEqual({ row: 3, col: 4 }, { row: 3, col: 4 })).toBe(true);
    });

    test('should return false for different positions', () => {
      expect(positionsEqual({ row: 3, col: 4 }, { row: 3, col: 5 })).toBe(
        false
      );
      expect(positionsEqual({ row: 3, col: 4 }, { row: 4, col: 4 })).toBe(
        false
      );
    });
  });

  describe('getMiddlePosition', () => {
    test('should calculate middle position correctly', () => {
      const from = { row: 2, col: 2 };
      const to = { row: 4, col: 4 };
      const middle = getMiddlePosition(from, to);

      expect(middle).toEqual({ row: 3, col: 3 });
    });

    test('should handle negative positions', () => {
      const from = { row: 1, col: 1 };
      const to = { row: 3, col: 3 };
      const middle = getMiddlePosition(from, to);

      expect(middle).toEqual({ row: 2, col: 2 });
    });
  });

  describe('isCaptureMove', () => {
    test('should return true for capture distance', () => {
      const from = { row: 2, col: 2 };
      const to = { row: 4, col: 4 };
      expect(isCaptureMove(from, to)).toBe(true);
    });

    test('should return false for regular move distance', () => {
      const from = { row: 2, col: 2 };
      const to = { row: 3, col: 3 };
      expect(isCaptureMove(from, to)).toBe(false);
    });
  });

  describe('getPiecesThatCanCapture', () => {
    test('should return pieces that can capture', () => {
      // Create a board with capture opportunity
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

      const capturingPieces = getPiecesThatCanCapture(
        testBoard2,
        PieceColor.LIGHT
      );
      expect(capturingPieces).toHaveLength(1);
      expect(capturingPieces[0].id).toBe('light-piece');
    });

    test('should return empty array when no captures available', () => {
      const capturingPieces = getPiecesThatCanCapture(board, PieceColor.LIGHT);
      expect(capturingPieces).toHaveLength(0);
    });
  });

  describe('mustCapture', () => {
    test('should return true when captures are available', () => {
      // Create a board with capture opportunity
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

      expect(mustCapture(testBoard2, PieceColor.LIGHT)).toBe(true);
    });

    test('should return false when no captures are available', () => {
      expect(mustCapture(board, PieceColor.LIGHT)).toBe(false);
    });
  });
});
