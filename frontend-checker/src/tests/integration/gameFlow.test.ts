import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../../hooks/useGameState';
import { createGameRulesEngine } from '../../utils/gameRules';
import { initializeBoard, setPieceAt } from '../../utils/gameLogic';
import {
  PieceColor,
  GameMode,
  GameStatus,
  GameResult,
  PieceType,
} from '../../constants/gameEnums';
import { BOARD_LAYOUT } from '../../constants/gameConstants';

// Mock the game rules engine
jest.mock('../../utils/gameRules', () => ({
  createGameRulesEngine: jest.fn(),
  getGameStatusMessage: jest.fn(),
  isGameOver: jest.fn(),
  isPlayerTurn: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Complete Game Flow Integration Tests', () => {
  const mockEngine = {
    executeMove: jest.fn(),
    getGameState: jest.fn(),
    getValidMovesForCurrentPlayer: jest.fn(),
    getCurrentPlayer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (createGameRulesEngine as jest.Mock).mockReturnValue(mockEngine);
  });

  describe('Complete Game Session', () => {
    test('should handle full game from start to finish', () => {
      const { result } = renderHook(() => useGameState());

      // Start the game
      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT);

      // Make several moves
      const moves = [
        {
          from: { row: 2, col: 2 },
          to: { row: 3, col: 3 },
          piece: {
            id: 'light-piece-1',
            color: PieceColor.LIGHT,
            type: PieceType.PAWN,
            position: { row: 2, col: 2 },
            isKing: false,
          },
          isKinging: false,
          isCapture: false,
          isMultipleJump: false,
        },
        {
          from: { row: 5, col: 5 },
          to: { row: 4, col: 4 },
          piece: {
            id: 'dark-piece-1',
            color: PieceColor.DARK,
            type: PieceType.PAWN,
            position: { row: 5, col: 5 },
            isKing: false,
          },
          isKinging: false,
          isCapture: false,
          isMultipleJump: false,
        },
      ];

      moves.forEach((move, index) => {
        const newGameState = {
          ...result.current.gameState,
          currentPlayer: index % 2 === 0 ? PieceColor.DARK : PieceColor.LIGHT,
          stats: {
            ...result.current.gameState.stats,
            moveCount: index + 1,
          },
        };

        mockEngine.executeMove.mockReturnValue(true);
        mockEngine.getGameState.mockReturnValue(newGameState);

        act(() => {
          result.current.actions.makeMove(move);
        });
      });

      expect(result.current.gameState.stats.moveCount).toBe(2);
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT);
    });

    test('should handle game with captures and kinging', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      // Create a capture move
      const captureMove = {
        from: { row: 2, col: 2 },
        to: { row: 4, col: 4 },
        piece: {
          id: 'light-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 2, col: 2 },
          isKing: false,
        },
        capturedPiece: {
          id: 'dark-piece',
          color: PieceColor.DARK,
          type: PieceType.PAWN,
          position: { row: 3, col: 3 },
          isKing: false,
        },
        isKinging: false,
        isCapture: true,
        isMultipleJump: false,
      };

      const newGameState = {
        ...result.current.gameState,
        currentPlayer: PieceColor.DARK,
        players: {
          ...result.current.gameState.players,
          light: {
            ...result.current.gameState.players.light,
            captures: 1,
          },
          dark: {
            ...result.current.gameState.players.dark,
            piecesRemaining: 11,
          },
        },
        stats: {
          ...result.current.gameState.stats,
          moveCount: 1,
          captures: {
            light: 1,
            dark: 0,
          },
        },
      };

      mockEngine.executeMove.mockReturnValue(true);
      mockEngine.getGameState.mockReturnValue(newGameState);

      act(() => {
        result.current.actions.makeMove(captureMove);
      });

      expect(result.current.gameState.players.light.captures).toBe(1);
      expect(result.current.gameState.players.dark.piecesRemaining).toBe(11);
      expect(result.current.gameState.stats.captures.light).toBe(1);

      // Create a kinging move
      const kingingMove = {
        from: { row: 6, col: 1 },
        to: { row: BOARD_LAYOUT.KING_ROW_LIGHT, col: 1 },
        piece: {
          id: 'light-piece-king',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 6, col: 1 },
          isKing: false,
        },
        isKinging: true,
        isCapture: false,
        isMultipleJump: false,
      };

      const kingingGameState = {
        ...newGameState,
        currentPlayer: PieceColor.DARK,
        stats: {
          ...newGameState.stats,
          moveCount: 2,
        },
      };

      mockEngine.getGameState.mockReturnValue(kingingGameState);

      act(() => {
        result.current.actions.makeMove(kingingMove);
      });

      expect(result.current.gameState.stats.moveCount).toBe(2);
    });
  });

  describe('Game State Persistence', () => {
    test('should save and load game state correctly', () => {
      const { result } = renderHook(() => useGameState());

      // Start game and make a move
      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      const move = {
        from: { row: 2, col: 2 },
        to: { row: 3, col: 3 },
        piece: {
          id: 'test-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 2, col: 2 },
          isKing: false,
        },
        isKinging: false,
        isCapture: false,
        isMultipleJump: false,
      };

      const newGameState = {
        ...result.current.gameState,
        currentPlayer: PieceColor.DARK,
        stats: {
          ...result.current.gameState.stats,
          moveCount: 1,
        },
      };

      mockEngine.executeMove.mockReturnValue(true);
      mockEngine.getGameState.mockReturnValue(newGameState);

      act(() => {
        result.current.actions.makeMove(move);
      });

      // Save the game
      act(() => {
        result.current.actions.saveGame();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'checkers-game-state',
        expect.any(String)
      );

      // Simulate loading saved game
      const savedState = {
        board: result.current.gameState.board,
        currentPlayer: PieceColor.DARK,
        gameStatus: GameStatus.PLAYING,
        moveHistory: result.current.gameState.moveHistory,
        selectedPiece: null,
        validMoves: [],
        highlightedSquares: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result: newResult } = renderHook(() => useGameState());

      act(() => {
        newResult.current.actions.loadGame();
      });

      expect(newResult.current.gameState.currentPlayer).toBe(PieceColor.DARK);
      expect(newResult.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
    });
  });

  describe('Undo/Redo Functionality', () => {
    test('should handle multiple undo operations', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      // Add several moves to history
      const moves = [
        {
          from: { row: 2, col: 2 },
          to: { row: 3, col: 3 },
          piece: {
            id: 'light-piece-1',
            color: PieceColor.LIGHT,
            type: PieceType.PAWN,
            position: { row: 2, col: 2 },
            isKing: false,
          },
          isKinging: false,
          isCapture: false,
          isMultipleJump: false,
          timestamp: Date.now(),
          moveNumber: 1,
        },
        {
          from: { row: 5, col: 5 },
          to: { row: 4, col: 4 },
          piece: {
            id: 'dark-piece-1',
            color: PieceColor.DARK,
            type: PieceType.PAWN,
            position: { row: 5, col: 5 },
            isKing: false,
          },
          isKinging: false,
          isCapture: false,
          isMultipleJump: false,
          timestamp: Date.now(),
          moveNumber: 2,
        },
      ];

      // Manually add moves to history for testing
      act(() => {
        result.current.gameState.moveHistory.push(...moves);
        result.current.gameState.currentPlayer = PieceColor.LIGHT;
        result.current.gameState.stats.moveCount = 2;
      });

      // Undo first move
      act(() => {
        result.current.actions.undoMove();
      });

      expect(result.current.gameState.moveHistory).toHaveLength(1);
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.DARK);
      expect(result.current.gameState.stats.moveCount).toBe(1);

      // Undo second move
      act(() => {
        result.current.actions.undoMove();
      });

      expect(result.current.gameState.moveHistory).toHaveLength(0);
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT);
      expect(result.current.gameState.stats.moveCount).toBe(0);
    });
  });

  describe('Game Modes', () => {
    test('should handle human vs human game mode', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_HUMAN);
      expect(result.current.gameState.players.light.isAI).toBe(false);
      expect(result.current.gameState.players.dark.isAI).toBe(false);
    });

    test('should handle human vs AI game mode', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_AI);
      });

      expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_AI);
      expect(result.current.gameState.players.light.isAI).toBe(false);
      expect(result.current.gameState.players.dark.isAI).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    test('should handle move execution errors gracefully', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      const invalidMove = {
        from: { row: 2, col: 2 },
        to: { row: 5, col: 5 }, // Invalid move
        piece: {
          id: 'test-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 2, col: 2 },
          isKing: false,
        },
        isKinging: false,
        isCapture: false,
        isMultipleJump: false,
      };

      mockEngine.executeMove.mockReturnValue(false);

      act(() => {
        result.current.actions.makeMove(invalidMove);
      });

      expect(result.current.error).toBe('Failed to execute move');
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT); // Should not change
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      // Should not throw error
      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
    });
  });

  describe('Game Statistics Tracking', () => {
    test('should track game statistics throughout play', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      const initialStats = result.current.gameState.stats;
      expect(initialStats.moveCount).toBe(0);
      expect(initialStats.captures.light).toBe(0);
      expect(initialStats.captures.dark).toBe(0);

      // Make a capture move
      const captureMove = {
        from: { row: 2, col: 2 },
        to: { row: 4, col: 4 },
        piece: {
          id: 'light-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 2, col: 2 },
          isKing: false,
        },
        capturedPiece: {
          id: 'dark-piece',
          color: PieceColor.DARK,
          type: PieceType.PAWN,
          position: { row: 3, col: 3 },
          isKing: false,
        },
        isKinging: false,
        isCapture: true,
        isMultipleJump: false,
      };

      const newGameState = {
        ...result.current.gameState,
        currentPlayer: PieceColor.DARK,
        players: {
          ...result.current.gameState.players,
          light: {
            ...result.current.gameState.players.light,
            captures: 1,
          },
          dark: {
            ...result.current.gameState.players.dark,
            piecesRemaining: 11,
          },
        },
        stats: {
          ...result.current.gameState.stats,
          moveCount: 1,
          captures: {
            light: 1,
            dark: 0,
          },
        },
      };

      mockEngine.executeMove.mockReturnValue(true);
      mockEngine.getGameState.mockReturnValue(newGameState);

      act(() => {
        result.current.actions.makeMove(captureMove);
      });

      const updatedStats = result.current.gameState.stats;
      expect(updatedStats.moveCount).toBe(1);
      expect(updatedStats.captures.light).toBe(1);
      expect(updatedStats.captures.dark).toBe(0);
    });
  });

  describe('Complex Game Scenarios', () => {
    test('should handle multiple jump sequence', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      // Create a multiple jump scenario
      const multipleJumpMove = {
        from: { row: 2, col: 2 },
        to: { row: 6, col: 6 },
        piece: {
          id: 'light-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 2, col: 2 },
          isKing: false,
        },
        capturedPiece: {
          id: 'dark-piece-1',
          color: PieceColor.DARK,
          type: PieceType.PAWN,
          position: { row: 3, col: 3 },
          isKing: false,
        },
        isKinging: false,
        isCapture: true,
        isMultipleJump: true,
      };

      const newGameState = {
        ...result.current.gameState,
        currentJumpingPiece: {
          id: 'light-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 6, col: 6 },
          isKing: false,
        },
        stats: {
          ...result.current.gameState.stats,
          moveCount: 1,
        },
      };

      mockEngine.executeMove.mockReturnValue(true);
      mockEngine.getGameState.mockReturnValue(newGameState);

      act(() => {
        result.current.actions.makeMove(multipleJumpMove);
      });

      expect(result.current.gameState.currentJumpingPiece).toBeDefined();
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT); // Should not switch turns
    });

    test('should handle game end scenario', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      // Simulate game end
      const gameEndMove = {
        from: { row: 2, col: 2 },
        to: { row: 3, col: 3 },
        piece: {
          id: 'light-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 2, col: 2 },
          isKing: false,
        },
        isKinging: false,
        isCapture: false,
        isMultipleJump: false,
      };

      const gameEndState = {
        ...result.current.gameState,
        gameStatus: GameStatus.FINISHED,
        gameResult: GameResult.LIGHT_WINS,
        stats: {
          ...result.current.gameState.stats,
          moveCount: 1,
        },
      };

      mockEngine.executeMove.mockReturnValue(true);
      mockEngine.getGameState.mockReturnValue(gameEndState);
      (
        require('../../utils/gameRules').isGameOver as jest.Mock
      ).mockReturnValue(true);

      act(() => {
        result.current.actions.makeMove(gameEndMove);
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.FINISHED);
      expect(result.current.gameState.gameResult).toBe(GameResult.LIGHT_WINS);
    });
  });
});
