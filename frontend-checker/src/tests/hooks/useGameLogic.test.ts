import { renderHook } from '@testing-library/react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { initializeBoard } from '../../utils/gameLogic';

describe('useGameLogic Hook', () => {
  test('should provide game logic functions', () => {
    const { result } = renderHook(() => useGameLogic());

    expect(result.current.isValidPosition).toBeDefined();
    expect(result.current.isLightSquare).toBeDefined();
    expect(result.current.getPieceAt).toBeDefined();
    expect(result.current.isValidMove).toBeDefined();
    expect(result.current.getValidMoves).toBeDefined();
    expect(result.current.canBeKinged).toBeDefined();
    expect(result.current.createMove).toBeDefined();
    expect(result.current.hasValidMoves).toBeDefined();
    expect(result.current.checkGameOver).toBeDefined();
  });

  test('should validate positions correctly', () => {
    const { result } = renderHook(() => useGameLogic());
    const board = initializeBoard();

    expect(result.current.isValidPosition({ row: 0, col: 0 }, 8)).toBe(true);
    expect(result.current.isValidPosition({ row: 7, col: 7 }, 8)).toBe(true);
    expect(result.current.isValidPosition({ row: -1, col: 0 }, 8)).toBe(false);
    expect(result.current.isValidPosition({ row: 0, col: 8 }, 8)).toBe(false);
  });

  test('should determine light squares correctly', () => {
    const { result } = renderHook(() => useGameLogic());

    expect(result.current.isLightSquare({ row: 0, col: 0 })).toBe(true);
    expect(result.current.isLightSquare({ row: 0, col: 1 })).toBe(false);
    expect(result.current.isLightSquare({ row: 1, col: 0 })).toBe(false);
    expect(result.current.isLightSquare({ row: 1, col: 1 })).toBe(true);
  });
});
