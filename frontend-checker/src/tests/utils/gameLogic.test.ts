import {
  initializeBoard,
  getPiecesByColor,
  countPiecesByColor,
} from '../../utils/gameLogic';
import { Board, PieceColor } from '../../types/game.types';

describe('Game Logic Utils', () => {
  let board: Board;

  beforeEach(() => {
    board = initializeBoard();
  });

  test('should initialize board with correct number of pieces', () => {
    const lightPieces = getPiecesByColor(board, PieceColor.LIGHT);
    const darkPieces = getPiecesByColor(board, PieceColor.DARK);

    expect(lightPieces).toHaveLength(12);
    expect(darkPieces).toHaveLength(12);
  });

  test('should count pieces correctly', () => {
    const lightCount = countPiecesByColor(board, PieceColor.LIGHT);
    const darkCount = countPiecesByColor(board, PieceColor.DARK);

    expect(lightCount).toBe(12);
    expect(darkCount).toBe(12);
  });

  test('should have correct board size', () => {
    expect(board.size).toBe(8);
    expect(board.squares).toHaveLength(8);
    expect(board.squares[0]).toHaveLength(8);
  });
});
