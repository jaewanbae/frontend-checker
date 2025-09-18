import {
  Board,
  Piece,
  Position,
  PieceColor,
  GameState,
} from '../../types/game.types';
import { PieceType, GameStatus, GameResult } from '../../constants/gameEnums';
import { setPieceAt, initializeBoard } from '../../utils/gameLogic';
import { getValidMovesForPlayer } from '../../utils/moveValidation';

describe('Mandatory Capture Rule', () => {
  let gameState: GameState;

  beforeEach(() => {
    // Create a fresh game state
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

  describe('Mandatory Capture Enforcement', () => {
    it('should only return capture moves when captures are available', () => {
      // Create a scenario where a light piece can capture a dark piece
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

      const otherLightPiece: Piece = {
        id: 'other-light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      // Set up the board with a capture opportunity
      gameState.board = setPieceAt(
        gameState.board,
        { row: 2, col: 2 },
        lightPiece
      );
      gameState.board = setPieceAt(
        gameState.board,
        { row: 3, col: 3 },
        darkPiece
      );
      gameState.board = setPieceAt(
        gameState.board,
        { row: 1, col: 1 },
        otherLightPiece
      );

      // Get valid moves for the light player
      const validMoves = getValidMovesForPlayer(
        gameState.board,
        PieceColor.LIGHT,
        null
      );

      // All valid moves should be captures
      validMoves.forEach(move => {
        expect(move.isCapture).toBe(true);
      });

      // Should not include regular moves when captures are available
      const regularMoves = validMoves.filter(move => !move.isCapture);
      expect(regularMoves).toHaveLength(0);
    });

    it('should return regular moves when no captures are available', () => {
      // Create a scenario with no capture opportunities
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      // Set up the board with no capture opportunities
      gameState.board = setPieceAt(
        gameState.board,
        { row: 2, col: 2 },
        lightPiece
      );

      // Get valid moves for the light player
      const validMoves = getValidMovesForPlayer(
        gameState.board,
        PieceColor.LIGHT,
        null
      );

      // Should include regular moves when no captures are available
      expect(validMoves.length).toBeGreaterThan(0);

      // All moves should be regular moves (not captures)
      validMoves.forEach(move => {
        expect(move.isCapture).toBe(false);
      });
    });
  });
});
