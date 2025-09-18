import { useGameState } from '../../hooks/useGameState';
import { renderHook, act } from '@testing-library/react';
import {
  PieceColor,
  GameMode,
  GameStatus,
  GameResult,
  PieceType,
} from '../../constants/gameEnums';
import { initializeBoard } from '../../utils/gameLogic';
import { createGameRulesEngine } from '../../utils/gameRules';

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

describe('useGameState Hook', () => {
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

  describe('Initial State', () => {
    test('should initialize with correct default state', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT);
      expect(result.current.gameState.gameStatus).toBe(GameStatus.WAITING);
      expect(result.current.gameState.gameResult).toBe(GameResult.NONE);
      expect(result.current.gameState.moveHistory).toHaveLength(0);
      expect(result.current.gameState.selectedPiece).toBeNull();
      expect(result.current.gameState.validMoves).toHaveLength(0);
      expect(result.current.gameState.highlightedSquares).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('should initialize board correctly', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.board.size).toBe(8);
      expect(result.current.gameState.players.light.piecesRemaining).toBe(12);
      expect(result.current.gameState.players.dark.piecesRemaining).toBe(12);
    });
  });

  describe('Piece Selection', () => {
    test('should select piece and show valid moves', () => {
      const { result } = renderHook(() => useGameState());

      const piece = {
        id: 'test-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      act(() => {
        result.current.actions.selectPiece(piece);
      });

      expect(result.current.gameState.selectedPiece).toEqual(piece);
      expect(result.current.gameState.highlightedSquares).toEqual([
        piece.position,
      ]);
    });

    test('should deselect piece', () => {
      const { result } = renderHook(() => useGameState());

      const piece = {
        id: 'test-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      act(() => {
        result.current.actions.selectPiece(piece);
      });

      expect(result.current.gameState.selectedPiece).toEqual(piece);

      act(() => {
        result.current.actions.deselectPiece();
      });

      expect(result.current.gameState.selectedPiece).toBeNull();
      expect(result.current.gameState.validMoves).toHaveLength(0);
      expect(result.current.gameState.highlightedSquares).toHaveLength(0);
    });
  });

  describe('Game Control', () => {
    test('should start game', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_HUMAN);
      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
      expect(result.current.gameState.players.dark.isAI).toBe(false);
    });

    test('should start human vs AI game', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_AI);
      });

      expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_AI);
      expect(result.current.gameState.players.dark.isAI).toBe(true);
    });

    test('should reset game', () => {
      const { result } = renderHook(() => useGameState());

      // Start a game first
      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);

      // Reset the game
      act(() => {
        result.current.actions.resetGame();
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.WAITING);
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT);
      expect(result.current.gameState.moveHistory).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Move Execution', () => {
    test('should execute valid move', () => {
      const { result } = renderHook(() => useGameState());

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

      expect(mockEngine.executeMove).toHaveBeenCalledWith(move);
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.DARK);
      expect(result.current.gameState.stats.moveCount).toBe(1);
      expect(result.current.gameState.selectedPiece).toBeNull();
    });

    test('should handle move execution failure', () => {
      const { result } = renderHook(() => useGameState());

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

      mockEngine.executeMove.mockReturnValue(false);

      act(() => {
        result.current.actions.makeMove(move);
      });

      expect(result.current.error).toBe('Failed to execute move');
    });

    test('should handle move execution error', () => {
      const { result } = renderHook(() => useGameState());

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

      mockEngine.executeMove.mockImplementation(() => {
        throw new Error('Test error');
      });

      act(() => {
        result.current.actions.makeMove(move);
      });

      expect(result.current.error).toBe('Test error');
    });
  });

  describe('Undo Move', () => {
    test('should undo last move', () => {
      const { result } = renderHook(() => useGameState());

      // Add a move to history first
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
        timestamp: Date.now(),
        moveNumber: 1,
      };

      act(() => {
        result.current.gameState.moveHistory.push(move);
        result.current.gameState.currentPlayer = PieceColor.DARK;
        result.current.gameState.stats.moveCount = 1;
      });

      act(() => {
        result.current.actions.undoMove();
      });

      expect(result.current.gameState.moveHistory).toHaveLength(0);
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT);
      expect(result.current.gameState.stats.moveCount).toBe(0);
    });

    test('should not undo when no moves available', () => {
      const { result } = renderHook(() => useGameState());

      const initialState = { ...result.current.gameState };

      act(() => {
        result.current.actions.undoMove();
      });

      expect(result.current.gameState).toEqual(initialState);
    });

    test('should handle undo with captured piece', () => {
      const { result } = renderHook(() => useGameState());

      const capturedPiece = {
        id: 'captured-piece',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        isKing: false,
      };

      const move = {
        from: { row: 2, col: 2 },
        to: { row: 4, col: 4 },
        piece: {
          id: 'test-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 2, col: 2 },
          isKing: false,
        },
        capturedPiece,
        isKinging: false,
        isCapture: true,
        isMultipleJump: false,
        timestamp: Date.now(),
        moveNumber: 1,
      };

      act(() => {
        result.current.gameState.moveHistory.push(move);
        result.current.gameState.players.light.captures = 1;
        result.current.gameState.players.dark.piecesRemaining = 11;
        result.current.gameState.stats.captures.light = 1;
      });

      act(() => {
        result.current.actions.undoMove();
      });

      expect(result.current.gameState.players.light.captures).toBe(0);
      expect(result.current.gameState.players.dark.piecesRemaining).toBe(12);
      expect(result.current.gameState.stats.captures.light).toBe(0);
    });

    test('should handle undo with kinging', () => {
      const { result } = renderHook(() => useGameState());

      const move = {
        from: { row: 6, col: 1 },
        to: { row: 7, col: 1 },
        piece: {
          id: 'test-piece',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 6, col: 1 },
          isKing: false,
        },
        isKinging: true,
        isCapture: false,
        isMultipleJump: false,
        timestamp: Date.now(),
        moveNumber: 1,
      };

      act(() => {
        result.current.gameState.moveHistory.push(move);
      });

      act(() => {
        result.current.actions.undoMove();
      });

      // The piece should be reverted to a regular piece
      expect(result.current.gameState.moveHistory).toHaveLength(0);
    });
  });

  describe('Highlighting', () => {
    test('should highlight moves', () => {
      const { result } = renderHook(() => useGameState());

      const positions = [
        { row: 3, col: 3 },
        { row: 3, col: 5 },
      ];

      act(() => {
        result.current.actions.highlightMoves(positions);
      });

      expect(result.current.gameState.highlightedSquares).toEqual(positions);
    });

    test('should clear highlights', () => {
      const { result } = renderHook(() => useGameState());

      const positions = [
        { row: 3, col: 3 },
        { row: 3, col: 5 },
      ];

      act(() => {
        result.current.actions.highlightMoves(positions);
      });

      expect(result.current.gameState.highlightedSquares).toEqual(positions);

      act(() => {
        result.current.actions.clearHighlights();
      });

      expect(result.current.gameState.highlightedSquares).toHaveLength(0);
    });
  });

  describe('Game Persistence', () => {
    test('should save game state', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
        result.current.actions.saveGame();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'checkers-game-state',
        expect.any(String)
      );
    });

    test('should load saved game', () => {
      const savedState = {
        board: initializeBoard(),
        currentPlayer: PieceColor.DARK,
        gameStatus: GameStatus.PLAYING,
        moveHistory: [],
        selectedPiece: null,
        validMoves: [],
        highlightedSquares: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.loadGame();
      });

      expect(result.current.gameState.currentPlayer).toBe(PieceColor.DARK);
      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
    });

    test('should clear saved game', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.clearSavedGame();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'checkers-game-state'
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'checkers-game-stats'
      );
    });
  });

  describe('Game Rules Utilities', () => {
    test('should get current player', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameRules.getCurrentPlayer()).toBe(
        PieceColor.LIGHT
      );
    });

    test('should get game status message', () => {
      const { result } = renderHook(() => useGameState());

      result.current.gameRules.getGameStatusMessage();
      expect(
        require('../../utils/gameRules').getGameStatusMessage
      ).toHaveBeenCalledWith(result.current.gameState);
    });

    test('should check if game is finished', () => {
      const { result } = renderHook(() => useGameState());

      result.current.gameRules.isGameFinished();
      expect(require('../../utils/gameRules').isGameOver).toHaveBeenCalledWith(
        result.current.gameState
      );
    });

    test('should check if it is player turn', () => {
      const { result } = renderHook(() => useGameState());

      result.current.gameRules.isCurrentPlayerTurn(PieceColor.LIGHT);
      expect(
        require('../../utils/gameRules').isPlayerTurn
      ).toHaveBeenCalledWith(result.current.gameState, PieceColor.LIGHT);
    });

    test('should get valid moves for current player', () => {
      const { result } = renderHook(() => useGameState());

      result.current.gameRules.getValidMovesForCurrentPlayer();
      expect(createGameRulesEngine).toHaveBeenCalledWith(
        result.current.gameState
      );
    });

    test('should get move history', () => {
      const { result } = renderHook(() => useGameState());

      const history = result.current.gameRules.getMoveHistory();
      expect(history).toEqual(result.current.gameState.moveHistory);
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useGameState());

      // Should not throw error and should continue with default state
      expect(result.current.gameState.currentPlayer).toBe(PieceColor.LIGHT);
    });

    test('should handle localStorage setItem errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
      });

      // Should not throw error and should continue normally
      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
    });
  });
});
