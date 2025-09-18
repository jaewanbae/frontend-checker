import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../../hooks/useGameState';
import { GameMode, GameStatus } from '../../constants/gameEnums';
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

describe('Game Mode Switching', () => {
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

  test('should switch from human vs human to human vs AI', () => {
    const { result } = renderHook(() => useGameState());

    // Start a human vs human game
    act(() => {
      result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
    });

    expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_HUMAN);
    expect(result.current.gameState.players.dark.isAI).toBe(false);

    // Switch to AI mode
    act(() => {
      result.current.actions.switchGameMode(GameMode.HUMAN_VS_AI);
    });

    expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_AI);
    expect(result.current.gameState.players.dark.isAI).toBe(true);
    expect(result.current.gameState.players.light.isAI).toBe(false);
  });

  test('should switch from human vs AI to human vs human', () => {
    const { result } = renderHook(() => useGameState());

    // Start a human vs AI game
    act(() => {
      result.current.actions.startGame(GameMode.HUMAN_VS_AI);
    });

    expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_AI);
    expect(result.current.gameState.players.dark.isAI).toBe(true);

    // Switch to human vs human mode
    act(() => {
      result.current.actions.switchGameMode(GameMode.HUMAN_VS_HUMAN);
    });

    expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_HUMAN);
    expect(result.current.gameState.players.dark.isAI).toBe(false);
    expect(result.current.gameState.players.light.isAI).toBe(false);
  });

  test('should maintain game state when switching modes', () => {
    const { result } = renderHook(() => useGameState());

    // Start a game
    act(() => {
      result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
    });

    const initialBoard = result.current.gameState.board;
    const initialCurrentPlayer = result.current.gameState.currentPlayer;
    const initialMoveHistory = result.current.gameState.moveHistory;

    // Switch to AI mode
    act(() => {
      result.current.actions.switchGameMode(GameMode.HUMAN_VS_AI);
    });

    // Game state should be preserved
    expect(result.current.gameState.board).toEqual(initialBoard);
    expect(result.current.gameState.currentPlayer).toBe(initialCurrentPlayer);
    expect(result.current.gameState.moveHistory).toEqual(initialMoveHistory);
    expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
  });

  test('should update AI status correctly for both players', () => {
    const { result } = renderHook(() => useGameState());

    // Start a human vs human game
    act(() => {
      result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
    });

    // Both players should be human
    expect(result.current.gameState.players.light.isAI).toBe(false);
    expect(result.current.gameState.players.dark.isAI).toBe(false);

    // Switch to AI mode
    act(() => {
      result.current.actions.switchGameMode(GameMode.HUMAN_VS_AI);
    });

    // Light player should remain human, dark player should become AI
    expect(result.current.gameState.players.light.isAI).toBe(false);
    expect(result.current.gameState.players.dark.isAI).toBe(true);

    // Switch back to human vs human
    act(() => {
      result.current.actions.switchGameMode(GameMode.HUMAN_VS_HUMAN);
    });

    // Both players should be human again
    expect(result.current.gameState.players.light.isAI).toBe(false);
    expect(result.current.gameState.players.dark.isAI).toBe(false);
  });

  test('should work during different game states', () => {
    const { result } = renderHook(() => useGameState());

    // Test switching during waiting state
    expect(result.current.gameState.gameStatus).toBe(GameStatus.WAITING);

    act(() => {
      result.current.actions.switchGameMode(GameMode.HUMAN_VS_AI);
    });

    expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_AI);

    // Start the game
    act(() => {
      result.current.actions.startGame(GameMode.HUMAN_VS_HUMAN);
    });

    // Test switching during playing state
    expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);

    act(() => {
      result.current.actions.switchGameMode(GameMode.HUMAN_VS_AI);
    });

    expect(result.current.gameState.gameMode).toBe(GameMode.HUMAN_VS_AI);
    expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
  });
});
