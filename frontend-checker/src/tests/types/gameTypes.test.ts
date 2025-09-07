import {
  Piece,
  Position,
  Board,
  Move,
  GameState,
  ValidationResult,
} from '../../types/game.types';

describe('Game Types', () => {
  test('should create valid Piece object', () => {
    const piece: Piece = {
      id: 'test-piece',
      color: 'light',
      type: 'pawn',
      position: { row: 0, col: 0 },
      isKing: false,
    };

    expect(piece.id).toBe('test-piece');
    expect(piece.color).toBe('light');
    expect(piece.type).toBe('pawn');
    expect(piece.position.row).toBe(0);
    expect(piece.position.col).toBe(0);
    expect(piece.isKing).toBe(false);
  });

  test('should create valid Position object', () => {
    const position: Position = { row: 3, col: 4 };

    expect(position.row).toBe(3);
    expect(position.col).toBe(4);
  });

  test('should create valid Board object', () => {
    const board: Board = {
      squares: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
      size: 8,
    };

    expect(board.size).toBe(8);
    expect(board.squares).toHaveLength(8);
    expect(board.squares[0]).toHaveLength(8);
  });

  test('should create valid ValidationResult object', () => {
    const result: ValidationResult = {
      isValid: true,
      reason: 'Valid move',
      isCapture: false,
    };

    expect(result.isValid).toBe(true);
    expect(result.reason).toBe('Valid move');
    expect(result.isCapture).toBe(false);
  });
});
