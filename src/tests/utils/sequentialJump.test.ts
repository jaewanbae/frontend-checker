import {
  Board,
  Piece,
  Position,
  PieceColor,
  GameState,
} from '../../types/game.types';
import { PieceType, GameStatus, GameResult } from '../../constants/gameEnums';
import { setPieceAt, getPieceAt, initializeBoard } from '../../utils/gameLogic';
import { GameRulesEngine } from '../../utils/gameRules';
import { getValidMovesForPlayer } from '../../utils/moveValidation';

describe('Sequential Jump Logic', () => {
  let gameState: GameState;
  let engine: GameRulesEngine;

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

    engine = new GameRulesEngine(gameState);
  });

  describe('Sequential Jump Enforcement', () => {
    it('should only allow moves from the current jumping piece during a jumping sequence', () => {
      // Create a scenario where a piece can make multiple jumps
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

      // Set up the board
      gameState.board = setPieceAt(
        gameState.board,
        { row: 2, col: 2 },
        jumpingPiece
      );
      gameState.board = setPieceAt(
        gameState.board,
        { row: 1, col: 1 },
        otherPiece
      );
      gameState.board = setPieceAt(
        gameState.board,
        { row: 3, col: 3 },
        darkPiece1
      );
      gameState.board = setPieceAt(
        gameState.board,
        { row: 5, col: 5 },
        darkPiece2
      );

      // Set the current jumping piece
      gameState.currentJumpingPiece = jumpingPiece;

      // Get valid moves for the current player
      const validMoves = getValidMovesForPlayer(
        gameState.board,
        PieceColor.LIGHT,
        gameState.currentJumpingPiece
      );

      // All valid moves should be from the jumping piece only
      validMoves.forEach(move => {
        expect(move.piece.id).toBe('jumping-piece');
      });

      // Should not include moves from the other piece
      const otherPieceMoves = validMoves.filter(
        move => move.piece.id === 'other-piece'
      );
      expect(otherPieceMoves).toHaveLength(0);
    });

    it('should allow all pieces to move when no jumping sequence is active', () => {
      // Create pieces that can move
      const piece1: Piece = {
        id: 'piece-1',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const piece2: Piece = {
        id: 'piece-2',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      // Set up the board
      gameState.board = setPieceAt(gameState.board, { row: 2, col: 2 }, piece1);
      gameState.board = setPieceAt(gameState.board, { row: 1, col: 1 }, piece2);

      // No current jumping piece
      gameState.currentJumpingPiece = null;

      // Get valid moves for the current player
      const validMoves = getValidMovesForPlayer(
        gameState.board,
        PieceColor.LIGHT,
        gameState.currentJumpingPiece
      );

      // Should include moves from both pieces
      const piece1Moves = validMoves.filter(
        move => move.piece.id === 'piece-1'
      );
      const piece2Moves = validMoves.filter(
        move => move.piece.id === 'piece-2'
      );

      expect(piece1Moves.length).toBeGreaterThan(0);
      expect(piece2Moves.length).toBeGreaterThan(0);
    });
  });
});
