import {
  Board,
  Piece,
  Move,
  PieceColor,
  GameState,
  GameStatus,
  GameResult,
} from '../types/game.types';
import {
  getValidMovesForPlayer,
  hasValidMoves,
  checkGameOver,
  validateMove,
} from './moveValidation';
import { movePiece, removePiece, promoteToKing, setPieceAt } from './gameLogic';
import { GAME_CONFIG } from '../constants/gameConstants';

// Game Rules Engine
export class GameRulesEngine {
  private gameState: GameState;

  constructor(initialGameState: GameState) {
    this.gameState = initialGameState;
  }

  // Get current game state
  getGameState(): GameState {
    return this.gameState;
  }

  // Update game state
  updateGameState(newState: GameState): void {
    this.gameState = newState;
  }

  // Turn Management
  getCurrentPlayer(): PieceColor {
    return this.gameState.currentPlayer;
  }

  getNextPlayer(): PieceColor {
    return this.gameState.currentPlayer === PieceColor.LIGHT
      ? PieceColor.DARK
      : PieceColor.LIGHT;
  }

  switchTurn(): void {
    this.gameState.currentPlayer = this.getNextPlayer();
    this.gameState.players.light.isActive =
      this.gameState.currentPlayer === PieceColor.LIGHT;
    this.gameState.players.dark.isActive =
      this.gameState.currentPlayer === PieceColor.DARK;
  }

  // Move History Tracking
  addMoveToHistory(move: Move): void {
    this.gameState.moveHistory.push({
      ...move,
      timestamp: Date.now(),
      moveNumber: this.gameState.moveHistory.length + 1,
    });
  }

  getMoveHistory(): Move[] {
    return this.gameState.moveHistory;
  }

  getLastMove(): Move | null {
    return this.gameState.moveHistory.length > 0
      ? this.gameState.moveHistory[this.gameState.moveHistory.length - 1]
      : null;
  }

  // Win Condition Detection
  checkWinConditions(): GameResult {
    const winner = checkGameOver(this.gameState.board);

    if (winner === PieceColor.LIGHT) {
      return GameResult.LIGHT_WINS;
    } else if (winner === PieceColor.DARK) {
      return GameResult.DARK_WINS;
    }

    // Check for draw conditions
    if (this.isDraw()) {
      return GameResult.DRAW;
    }

    return GameResult.NONE;
  }

  // Check for draw conditions
  private isDraw(): boolean {
    // Check if both players have no valid moves (stalemate)
    const lightHasMoves = hasValidMoves(this.gameState.board, PieceColor.LIGHT);
    const darkHasMoves = hasValidMoves(this.gameState.board, PieceColor.DARK);

    if (!lightHasMoves && !darkHasMoves) {
      return true;
    }

    // Check for repetitive moves (optional - can be implemented later)
    // Check for insufficient material (optional - can be implemented later)

    return false;
  }

  // Game State Transitions
  startGame(): void {
    this.gameState.gameStatus = GameStatus.PLAYING;
    this.gameState.gameResult = GameResult.NONE;
    this.gameState.currentPlayer = PieceColor.LIGHT;
    this.gameState.players.light.isActive = true;
    this.gameState.players.dark.isActive = false;
  }

  pauseGame(): void {
    if (this.gameState.gameStatus === GameStatus.PLAYING) {
      this.gameState.gameStatus = GameStatus.PAUSED;
    }
  }

  resumeGame(): void {
    if (this.gameState.gameStatus === GameStatus.PAUSED) {
      this.gameState.gameStatus = GameStatus.PLAYING;
    }
  }

  endGame(result: GameResult): void {
    this.gameState.gameStatus = GameStatus.FINISHED;
    this.gameState.gameResult = result;
  }

  resetGame(): void {
    this.gameState = {
      ...this.gameState,
      board: this.initializeBoard(),
      currentPlayer: PieceColor.LIGHT,
      players: {
        light: {
          color: PieceColor.LIGHT,
          isAI: false,
          piecesRemaining: GAME_CONFIG.PIECES_PER_PLAYER,
          captures: 0,
          isActive: true,
        },
        dark: {
          color: PieceColor.DARK,
          isAI: false,
          piecesRemaining: GAME_CONFIG.PIECES_PER_PLAYER,
          captures: 0,
          isActive: false,
        },
      },
      gameStatus: GameStatus.WAITING,
      gameResult: GameResult.NONE,
      moveHistory: [],
      selectedPiece: null,
      validMoves: [],
      highlightedSquares: [],
    };
  }

  // Move Execution
  executeMove(move: Move): boolean {
    // Validate the move
    const validation = validateMove(
      this.gameState.board,
      move.piece,
      move.from,
      move.to
    );

    if (!validation.isValid) {
      return false;
    }

    // Execute the move
    let newBoard = movePiece(this.gameState.board, move.from, move.to);

    // Handle capture
    if (move.capturedPiece) {
      newBoard = removePiece(newBoard, move.capturedPiece.position);

      // Update capture count
      if (move.piece.color === PieceColor.LIGHT) {
        this.gameState.players.light.captures++;
        this.gameState.stats.captures.light++;
      } else {
        this.gameState.players.dark.captures++;
        this.gameState.stats.captures.dark++;
      }
    }

    // Handle kinging
    if (move.isKinging) {
      const kingedPiece = promoteToKing(move.piece);
      newBoard = setPieceAt(newBoard, move.to, kingedPiece);
    }

    // Update board
    this.gameState.board = newBoard;

    // Add to move history
    this.addMoveToHistory(move);

    // Update move count
    this.gameState.stats.moveCount++;

    // Check for win conditions
    const gameResult = this.checkWinConditions();
    if (gameResult !== GameResult.NONE) {
      this.endGame(gameResult);
      return true;
    }

    // Switch turns
    this.switchTurn();

    return true;
  }

  // Get valid moves for current player
  getValidMovesForCurrentPlayer(): Move[] {
    return getValidMovesForPlayer(
      this.gameState.board,
      this.gameState.currentPlayer
    );
  }

  // Check if current player has valid moves
  currentPlayerHasValidMoves(): boolean {
    return hasValidMoves(this.gameState.board, this.gameState.currentPlayer);
  }

  // Game Statistics
  updateGameTime(timeElapsed: number): void {
    this.gameState.stats.gameTime = timeElapsed;
  }

  getGameStats() {
    return this.gameState.stats;
  }

  // Helper function to initialize board (imported from gameLogic)
  private initializeBoard(): Board {
    // This would import from gameLogic, but to avoid circular imports,
    // we'll create a simple board initialization here
    const squares: (Piece | null)[][] = Array(GAME_CONFIG.BOARD_SIZE)
      .fill(null)
      .map(() => Array(GAME_CONFIG.BOARD_SIZE).fill(null));

    return {
      squares,
      size: GAME_CONFIG.BOARD_SIZE,
    };
  }
}

// Utility functions for game rules
export const createGameRulesEngine = (
  gameState: GameState
): GameRulesEngine => {
  return new GameRulesEngine(gameState);
};

// Check if a move is legal for the current game state
export const isLegalMove = (gameState: GameState, move: Move): boolean => {
  const engine = new GameRulesEngine(gameState);
  const validMoves = engine.getValidMovesForCurrentPlayer();

  return validMoves.some(
    validMove =>
      validMove.from.row === move.from.row &&
      validMove.from.col === move.from.col &&
      validMove.to.row === move.to.row &&
      validMove.to.col === move.to.col
  );
};

// Get game status message
export const getGameStatusMessage = (gameState: GameState): string => {
  switch (gameState.gameStatus) {
    case GameStatus.WAITING:
      return 'Waiting to start game';
    case GameStatus.PLAYING:
      return `Current player: ${gameState.currentPlayer === PieceColor.LIGHT ? 'Light' : 'Dark'}`;
    case GameStatus.PAUSED:
      return 'Game is paused';
    case GameStatus.FINISHED:
      switch (gameState.gameResult) {
        case GameResult.LIGHT_WINS:
          return 'Light player wins!';
        case GameResult.DARK_WINS:
          return 'Dark player wins!';
        case GameResult.DRAW:
          return 'Game ended in a draw';
        default:
          return 'Game finished';
      }
    default:
      return 'Unknown game status';
  }
};

// Check if game is over
export const isGameOver = (gameState: GameState): boolean => {
  return gameState.gameStatus === GameStatus.FINISHED;
};

// Check if it's a specific player's turn
export const isPlayerTurn = (
  gameState: GameState,
  playerColor: PieceColor
): boolean => {
  return (
    gameState.currentPlayer === playerColor &&
    gameState.gameStatus === GameStatus.PLAYING
  );
};
