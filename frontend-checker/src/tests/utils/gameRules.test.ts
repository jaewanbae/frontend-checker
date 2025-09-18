import {
  GameRulesEngine,
  createGameRulesEngine,
  getGameStatusMessage,
  isGameOver,
  isPlayerTurn,
} from '../../utils/gameRules';
import {
  initializeBoard,
  setPieceAt,
  movePiece,
  removePiece,
  promoteToKing,
} from '../../utils/gameLogic';
import {
  Board,
  Piece,
  Position,
  PieceColor,
  GameState,
  Move,
} from '../../types/game.types';
import {
  PieceType,
  GameStatus,
  GameResult,
  GameMode,
} from '../../constants/gameEnums';
import { GAME_CONFIG, BOARD_LAYOUT } from '../../constants/gameConstants';

describe('Game Rules Engine', () => {
  let gameState: GameState;
  let engine: GameRulesEngine;

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
          isAI: false,
          piecesRemaining: 12,
          captures: 0,
          isActive: false,
        },
      },
      gameMode: GameMode.HUMAN_VS_HUMAN,
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

  describe('GameRulesEngine Constructor', () => {
    test('should initialize with provided game state', () => {
      const initialState = engine.getGameState();
      expect(initialState).toEqual(gameState);
    });
  });

  describe('Turn Management', () => {
    test('should get current player', () => {
      expect(engine.getCurrentPlayer()).toBe(PieceColor.LIGHT);
    });

    test('should get next player', () => {
      expect(engine.getNextPlayer()).toBe(PieceColor.DARK);

      engine.switchTurn();
      expect(engine.getNextPlayer()).toBe(PieceColor.LIGHT);
    });

    test('should switch turns correctly', () => {
      expect(engine.getCurrentPlayer()).toBe(PieceColor.LIGHT);

      engine.switchTurn();
      const newState = engine.getGameState();

      expect(newState.currentPlayer).toBe(PieceColor.DARK);
      expect(newState.players.light.isActive).toBe(false);
      expect(newState.players.dark.isActive).toBe(true);
    });
  });

  describe('Move History Tracking', () => {
    test('should add move to history', () => {
      const move: Move = {
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

      engine.addMoveToHistory(move);
      const history = engine.getMoveHistory();

      expect(history).toHaveLength(1);
      expect(history[0]).toEqual({
        ...move,
        timestamp: expect.any(Number),
        moveNumber: 1,
      });
    });

    test('should get last move', () => {
      const move1: Move = {
        from: { row: 2, col: 2 },
        to: { row: 3, col: 3 },
        piece: {
          id: 'test-piece-1',
          color: PieceColor.LIGHT,
          type: PieceType.PAWN,
          position: { row: 2, col: 2 },
          isKing: false,
        },
        isKinging: false,
        isCapture: false,
        isMultipleJump: false,
      };

      const move2: Move = {
        from: { row: 5, col: 5 },
        to: { row: 4, col: 4 },
        piece: {
          id: 'test-piece-2',
          color: PieceColor.DARK,
          type: PieceType.PAWN,
          position: { row: 5, col: 5 },
          isKing: false,
        },
        isKinging: false,
        isCapture: false,
        isMultipleJump: false,
      };

      engine.addMoveToHistory(move1);
      engine.addMoveToHistory(move2);

      const lastMove = engine.getLastMove();
      expect(lastMove).toEqual({
        ...move2,
        timestamp: expect.any(Number),
        moveNumber: 2,
      });
    });

    test('should return null for last move when history is empty', () => {
      expect(engine.getLastMove()).toBeNull();
    });
  });

  describe('Win Condition Detection', () => {
    test('should return NONE when game is not over', () => {
      expect(engine.checkWinConditions()).toBe(GameResult.NONE);
    });

    test('should detect light player win', () => {
      // Create a board where dark player has no moves
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const trappedDarkPiece: Piece = {
        id: 'trapped-dark',
        color: PieceColor.DARK,
        type: PieceType.PAWN,
        position: { row: 0, col: 0 },
        isKing: false,
      };

      // Block the only possible move by placing a piece at (1,1)
      const blockingPiece: Piece = {
        id: 'blocking-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 1, col: 1 },
        isKing: false,
      };

      let testBoard = setPieceAt(
        emptyBoard,
        { row: 0, col: 0 },
        trappedDarkPiece
      );
      testBoard = setPieceAt(testBoard, { row: 1, col: 1 }, blockingPiece);
      engine.updateGameState({ ...gameState, board: testBoard });

      expect(engine.checkWinConditions()).toBe(GameResult.LIGHT_WINS);
    });

    test('should detect dark player win', () => {
      // Create a board where light player has no moves
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const trappedLightPiece: Piece = {
        id: 'trapped-light',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 7, col: 0 },
        isKing: false,
      };

      const testBoard = setPieceAt(
        emptyBoard,
        { row: 7, col: 0 },
        trappedLightPiece
      );
      engine.updateGameState({ ...gameState, board: testBoard });

      expect(engine.checkWinConditions()).toBe(GameResult.DARK_WINS);
    });
  });

  describe('Game State Transitions', () => {
    test('should start game', () => {
      engine.startGame();
      const state = engine.getGameState();

      expect(state.gameStatus).toBe(GameStatus.PLAYING);
      expect(state.gameResult).toBe(GameResult.NONE);
      expect(state.currentPlayer).toBe(PieceColor.LIGHT);
      expect(state.players.light.isActive).toBe(true);
      expect(state.players.dark.isActive).toBe(false);
      expect(state.currentJumpingPiece).toBeNull();
    });

    test('should end game with result', () => {
      engine.endGame(GameResult.LIGHT_WINS);
      const state = engine.getGameState();

      expect(state.gameStatus).toBe(GameStatus.FINISHED);
      expect(state.gameResult).toBe(GameResult.LIGHT_WINS);
    });

    test('should reset game', () => {
      // Modify the game state first
      engine.addMoveToHistory({
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
      });

      engine.resetGame();
      const state = engine.getGameState();

      expect(state.moveHistory).toHaveLength(0);
      expect(state.currentPlayer).toBe(PieceColor.LIGHT);
      expect(state.gameStatus).toBe(GameStatus.WAITING);
      expect(state.gameResult).toBe(GameResult.NONE);
      expect(state.players.light.piecesRemaining).toBe(
        GAME_CONFIG.PIECES_PER_PLAYER
      );
      expect(state.players.dark.piecesRemaining).toBe(
        GAME_CONFIG.PIECES_PER_PLAYER
      );
    });
  });

  describe('Move Execution', () => {
    test('should execute valid normal move', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const testBoard = setPieceAt(
        gameState.board,
        { row: 2, col: 2 },
        lightPiece
      );
      engine.updateGameState({ ...gameState, board: testBoard });

      const move: Move = {
        from: { row: 2, col: 2 },
        to: { row: 3, col: 3 },
        piece: lightPiece,
        isKinging: false,
        isCapture: false,
        isMultipleJump: false,
      };

      const result = engine.executeMove(move);
      expect(result).toBe(true);

      const newState = engine.getGameState();
      expect(newState.currentPlayer).toBe(PieceColor.DARK);
      expect(newState.moveHistory).toHaveLength(1);
      expect(newState.stats.moveCount).toBe(1);
    });

    test('should execute capture move', () => {
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

      const testBoard = setPieceAt(
        gameState.board,
        { row: 2, col: 2 },
        lightPiece
      );
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece);
      engine.updateGameState({ ...gameState, board: testBoard2 });

      const move: Move = {
        from: { row: 2, col: 2 },
        to: { row: 4, col: 4 },
        piece: lightPiece,
        capturedPiece: darkPiece,
        isKinging: false,
        isCapture: true,
        isMultipleJump: false,
      };

      const result = engine.executeMove(move);
      expect(result).toBe(true);

      const newState = engine.getGameState();
      expect(newState.players.light.captures).toBe(1);
      expect(newState.players.dark.piecesRemaining).toBe(11);
      expect(newState.stats.captures.light).toBe(1);
    });

    test('should execute kinging move', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 6, col: 1 },
        isKing: false,
      };

      // Use empty board to avoid conflicts
      const emptyBoard: Board = {
        squares: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        size: 8,
      };

      const testBoard = setPieceAt(emptyBoard, { row: 6, col: 1 }, lightPiece);
      engine.updateGameState({ ...gameState, board: testBoard });

      const move: Move = {
        from: { row: 6, col: 1 },
        to: { row: BOARD_LAYOUT.KING_ROW_LIGHT, col: 2 }, // Move diagonally
        piece: lightPiece,
        isKinging: true,
        isCapture: false,
        isMultipleJump: false,
      };

      const result = engine.executeMove(move);
      expect(result).toBe(true);

      const newState = engine.getGameState();
      const kingedPiece =
        newState.board.squares[BOARD_LAYOUT.KING_ROW_LIGHT][2];
      expect(kingedPiece?.isKing).toBe(true);
      expect(kingedPiece?.type).toBe(PieceType.KING);
    });

    test('should reject invalid move', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
        isKing: false,
      };

      const testBoard = setPieceAt(
        gameState.board,
        { row: 2, col: 2 },
        lightPiece
      );
      engine.updateGameState({ ...gameState, board: testBoard });

      const invalidMove: Move = {
        from: { row: 2, col: 2 },
        to: { row: 5, col: 5 }, // Invalid: too far
        piece: lightPiece,
        isKinging: false,
        isCapture: false,
        isMultipleJump: false,
      };

      const result = engine.executeMove(invalidMove);
      expect(result).toBe(false);
    });

    test('should handle multiple jump sequences', () => {
      const lightPiece: Piece = {
        id: 'light-piece',
        color: PieceColor.LIGHT,
        type: PieceType.PAWN,
        position: { row: 2, col: 2 },
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

      const testBoard = setPieceAt(
        gameState.board,
        { row: 2, col: 2 },
        lightPiece
      );
      const testBoard2 = setPieceAt(testBoard, { row: 3, col: 3 }, darkPiece1);
      const testBoard3 = setPieceAt(testBoard2, { row: 5, col: 5 }, darkPiece2);
      engine.updateGameState({ ...gameState, board: testBoard3 });

      const firstJump: Move = {
        from: { row: 2, col: 2 },
        to: { row: 4, col: 4 },
        piece: lightPiece,
        capturedPiece: darkPiece1,
        isKinging: false,
        isCapture: true,
        isMultipleJump: true,
      };

      const result = engine.executeMove(firstJump);
      expect(result).toBe(true);

      const newState = engine.getGameState();
      expect(newState.currentJumpingPiece).toBeDefined();
      expect(newState.currentPlayer).toBe(PieceColor.LIGHT); // Should not switch turns
    });
  });

  describe('Valid Moves', () => {
    test('should get valid moves for current player', () => {
      const validMoves = engine.getValidMovesForCurrentPlayer();
      expect(Array.isArray(validMoves)).toBe(true);
    });

    test('should check if current player has valid moves', () => {
      expect(engine.currentPlayerHasValidMoves()).toBe(true);
    });
  });

  describe('Game Statistics', () => {
    test('should update game time', () => {
      engine.updateGameTime(5000);
      const stats = engine.getGameStats();
      expect(stats.gameTime).toBe(5000);
    });

    test('should get game stats', () => {
      const stats = engine.getGameStats();
      expect(stats).toEqual({
        moveCount: 0,
        gameTime: 0,
        captures: {
          light: 0,
          dark: 0,
        },
      });
    });
  });
});

describe('Game Rules Utility Functions', () => {
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
          isAI: false,
          piecesRemaining: 12,
          captures: 0,
          isActive: false,
        },
      },
      gameMode: GameMode.HUMAN_VS_HUMAN,
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

  describe('createGameRulesEngine', () => {
    test('should create engine with game state', () => {
      const engine = createGameRulesEngine(gameState);
      expect(engine).toBeInstanceOf(GameRulesEngine);
      expect(engine.getGameState()).toEqual(gameState);
    });
  });

  describe('getGameStatusMessage', () => {
    test('should return waiting message', () => {
      const waitingState = { ...gameState, gameStatus: GameStatus.WAITING };
      expect(getGameStatusMessage(waitingState)).toBe('Waiting to start game');
    });

    test('should return playing message for light player', () => {
      expect(getGameStatusMessage(gameState)).toBe('Current player: Light');
    });

    test('should return playing message for dark player', () => {
      const darkTurnState = { ...gameState, currentPlayer: PieceColor.DARK };
      expect(getGameStatusMessage(darkTurnState)).toBe('Current player: Dark');
    });

    test('should return light wins message', () => {
      const finishedState = {
        ...gameState,
        gameStatus: GameStatus.FINISHED,
        gameResult: GameResult.LIGHT_WINS,
      };
      expect(getGameStatusMessage(finishedState)).toBe('Light player wins!');
    });

    test('should return dark wins message', () => {
      const finishedState = {
        ...gameState,
        gameStatus: GameStatus.FINISHED,
        gameResult: GameResult.DARK_WINS,
      };
      expect(getGameStatusMessage(finishedState)).toBe('Dark player wins!');
    });

    test('should return draw message', () => {
      const finishedState = {
        ...gameState,
        gameStatus: GameStatus.FINISHED,
        gameResult: GameResult.DRAW,
      };
      expect(getGameStatusMessage(finishedState)).toBe('Game ended in a draw');
    });

    test('should return unknown status message', () => {
      const unknownState = { ...gameState, gameStatus: 'unknown' as any };
      expect(getGameStatusMessage(unknownState)).toBe('Unknown game status');
    });
  });

  describe('isGameOver', () => {
    test('should return false when game is not finished', () => {
      expect(isGameOver(gameState)).toBe(false);
    });

    test('should return true when game is finished', () => {
      const finishedState = {
        ...gameState,
        gameStatus: GameStatus.FINISHED,
      };
      expect(isGameOver(finishedState)).toBe(true);
    });
  });

  describe('isPlayerTurn', () => {
    test('should return true for current player during playing status', () => {
      expect(isPlayerTurn(gameState, PieceColor.LIGHT)).toBe(true);
      expect(isPlayerTurn(gameState, PieceColor.DARK)).toBe(false);
    });

    test('should return false for non-current player', () => {
      expect(isPlayerTurn(gameState, PieceColor.DARK)).toBe(false);
    });

    test('should return false when game is not playing', () => {
      const waitingState = { ...gameState, gameStatus: GameStatus.WAITING };
      expect(isPlayerTurn(waitingState, PieceColor.LIGHT)).toBe(false);
    });

    test('should return false when game is finished', () => {
      const finishedState = {
        ...gameState,
        gameStatus: GameStatus.FINISHED,
      };
      expect(isPlayerTurn(finishedState, PieceColor.LIGHT)).toBe(false);
    });
  });
});
