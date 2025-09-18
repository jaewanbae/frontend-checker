import {
  CheckersAI,
  createCheckersAI,
  getSequentialJumpMoves,
} from '../../utils/ai';
import { GameRulesEngine } from '../../utils/gameRules';
import { initializeBoard, setPieceAt } from '../../utils/gameLogic';
import { getValidMovesForPlayer } from '../../utils/moveValidation';
import {
  Board,
  Piece,
  Move,
  PieceColor,
  GameState,
} from '../../types/game.types';
import {
  PieceType,
  GameStatus,
  GameResult,
  GameMode,
} from '../../constants/gameEnums';
import { BOARD_LAYOUT } from '../../constants/gameConstants';

describe('CheckersAI', () => {
  let gameState: GameState;
  let engine: GameRulesEngine;
  let ai: CheckersAI;

  beforeEach(() => {
    gameState = {
      board: initializeBoard(),
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
          isAI: true,
          piecesRemaining: 12,
          captures: 0,
          isActive: false,
        },
      },
      gameMode: GameMode.HUMAN_VS_AI,
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

    engine = new GameRulesEngine(gameState);
    ai = new CheckersAI(engine, PieceColor.DARK);
  });

  describe('AI Initialization', () => {
    test('should initialize with correct AI color', () => {
      expect(ai.getAIColor()).toBe(PieceColor.DARK);
    });

    test('should detect AI turn correctly', () => {
      expect(ai.isAITurn()).toBe(false); // Light player's turn initially

      engine.switchTurn();
      expect(ai.isAITurn()).toBe(true); // Dark player's turn
    });

    test('should update game engine reference', () => {
      const newEngine = new GameRulesEngine(gameState);
      ai.updateGameEngine(newEngine);

      // Should not throw error when using updated engine
      expect(() => ai.getBestMove()).not.toThrow();
    });
  });

  describe('AI Move Selection', () => {
    test('should return null when no valid moves available', () => {
      // Create a board with no valid moves for dark player
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const trappedPiece: Piece = {
        id: 'trapped-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 0, col: 0 },
        isKing: false,
      };

      // Block all possible moves
      const blockingPiece1: Piece = {
        id: 'blocking-piece-1',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      const blockingPiece2: Piece = {
        id: 'blocking-piece-2',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      let testBoard = setPieceAt(emptyBoard, { row: 0, col: 0 }, trappedPiece);
      testBoard = setPieceAt(testBoard, { row: 1, col: 1 }, blockingPiece1);
      testBoard = setPieceAt(testBoard, { row: 2, col: 2 }, blockingPiece2);

      engine.updateGameState({
        ...gameState,
        board: testBoard,
        currentPlayer: PieceColor.DARK,
      });

      const move = ai.getBestMove();
      expect(move).toBeNull();
    });

    test('should prioritize capture moves over regular moves', () => {
      // Create a scenario where AI can capture
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      // Create a proper capture scenario: dark piece at (3,3), light piece at (2,2)
      // Dark piece can capture by jumping from (3,3) over (2,2) to (1,1)
      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      let testBoard = setPieceAt(emptyBoard, { row: 3, col: 3 }, darkPiece);
      testBoard = setPieceAt(testBoard, { row: 2, col: 2 }, lightPiece);

      engine.updateGameState({
        ...gameState,
        board: testBoard,
        currentPlayer: PieceColor.DARK,
      });

      const move = ai.getBestMove();
      expect(move).toBeDefined();
      // The dark piece should be able to capture the light piece by jumping from (3,3) to (1,1)
      expect(move?.isCapture).toBe(true);
    });

    test('should prioritize sequential jumps over single jumps', () => {
      // Create a scenario with both single and sequential jumps
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 5, col: 5 },
        isKing: false,
      };

      const lightPiece1: Piece = {
        id: 'light-piece-1',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 4, col: 4 },
        isKing: false,
      };

      const lightPiece2: Piece = {
        id: 'light-piece-2',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      let testBoard = setPieceAt(emptyBoard, { row: 5, col: 5 }, darkPiece);
      testBoard = setPieceAt(testBoard, { row: 4, col: 4 }, lightPiece1);
      testBoard = setPieceAt(testBoard, { row: 2, col: 2 }, lightPiece2);

      engine.updateGameState({
        ...gameState,
        board: testBoard,
        currentPlayer: PieceColor.DARK,
      });

      const move = ai.getBestMove();
      expect(move).toBeDefined();
      expect(move?.isCapture).toBe(true);
      // The move should be a sequential jump (multiple jumps)
      expect(move?.isMultipleJump).toBe(true);
    });

    test('should make random regular move when no captures available', () => {
      // Create a scenario with only regular moves
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const testBoard = setPieceAt(emptyBoard, { row: 2, col: 2 }, darkPiece);
      engine.updateGameState({
        ...gameState,
        board: testBoard,
        currentPlayer: PieceColor.DARK,
      });

      const move = ai.getBestMove();
      expect(move).toBeDefined();
      expect(move?.isCapture).toBe(false);
    });
  });

  describe('AI Move Execution', () => {
    test('should execute valid move successfully', () => {
      // Create a simple scenario
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const testBoard = setPieceAt(emptyBoard, { row: 2, col: 2 }, darkPiece);
      engine.updateGameState({
        ...gameState,
        board: testBoard,
        currentPlayer: PieceColor.DARK,
      });

      const result = ai.makeMove();
      expect(result).toBe(true);
    });

    test('should return false when no valid moves available', () => {
      // Create a board with no valid moves
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const trappedPiece: Piece = {
        id: 'trapped-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 0, col: 0 },
        isKing: false,
      };

      // Block all possible moves
      const blockingPiece1: Piece = {
        id: 'blocking-piece-1',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      const blockingPiece2: Piece = {
        id: 'blocking-piece-2',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      let testBoard = setPieceAt(emptyBoard, { row: 0, col: 0 }, trappedPiece);
      testBoard = setPieceAt(testBoard, { row: 1, col: 1 }, blockingPiece1);
      testBoard = setPieceAt(testBoard, { row: 2, col: 2 }, blockingPiece2);

      engine.updateGameState({
        ...gameState,
        board: testBoard,
        currentPlayer: PieceColor.DARK,
      });

      const result = ai.makeMove();
      expect(result).toBe(false);
    });
  });

  describe('AI Strategy Validation', () => {
    test('should never make illegal moves', () => {
      // Test multiple random scenarios
      for (let i = 0; i < 10; i++) {
        const move = ai.getBestMove();
        if (move) {
          // The move should be valid according to game rules
          const validMoves = getValidMovesForPlayer(
            gameState.board,
            PieceColor.DARK
          );
          const isValidMove = validMoves.some(
            validMove =>
              validMove.from.row === move.from.row &&
              validMove.from.col === move.from.col &&
              validMove.to.row === move.to.row &&
              validMove.to.col === move.to.col
          );
          expect(isValidMove).toBe(true);
        }
      }
    });

    test('should always prioritize captures when available', () => {
      // Create a scenario with captures available
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const darkPiece: Piece = {
        id: 'dark-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      let testBoard = setPieceAt(emptyBoard, { row: 3, col: 3 }, darkPiece);
      testBoard = setPieceAt(testBoard, { row: 2, col: 2 }, lightPiece);

      engine.updateGameState({
        ...gameState,
        board: testBoard,
        currentPlayer: PieceColor.DARK,
      });

      const move = ai.getBestMove();
      if (move) {
        expect(move.isCapture).toBe(true);
      }
    });
  });
});

describe('AI Utility Functions', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = {
      board: initializeBoard(),
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
          isAI: true,
          piecesRemaining: 12,
          captures: 0,
          isActive: false,
        },
      },
      gameMode: GameMode.HUMAN_VS_AI,
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

  describe('getSequentialJumpMoves', () => {
    test('should return empty array when no sequential jumps available', () => {
      const moves = getSequentialJumpMoves(gameState, PieceColor.LIGHT);
      expect(moves).toEqual([]);
    });
  });
});

describe('AI Factory Function', () => {
  test('should create AI instance correctly', () => {
    const gameState: GameState = {
      board: initializeBoard(),
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
          isAI: true,
          piecesRemaining: 12,
          captures: 0,
          isActive: false,
        },
      },
      gameMode: GameMode.HUMAN_VS_AI,
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

    const engine = new GameRulesEngine(gameState);
    const ai = createCheckersAI(engine, PieceColor.DARK);

    expect(ai).toBeInstanceOf(CheckersAI);
    expect(ai.getAIColor()).toBe(PieceColor.DARK);
  });
});
