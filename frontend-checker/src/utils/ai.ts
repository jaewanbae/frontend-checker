import { Board, Piece, Move, PieceColor, GameState } from '../types/game.types';
import { getValidMovesForPlayer, findJumpSequences } from './moveValidation';
import { GameRulesEngine } from './gameRules';

/**
 * AI Player for Checkers Game
 * Implements a "dumb" AI that follows basic checkers strategy:
 * 1. Makes jump moves if available
 * 2. Prioritizes sequential jumps over single jumps
 * 3. If no jumps available, makes random valid moves
 * 4. Never makes illegal moves
 */
export class CheckersAI {
  private gameEngine: GameRulesEngine;
  private aiColor: PieceColor;

  constructor(gameEngine: GameRulesEngine, aiColor: PieceColor) {
    this.gameEngine = gameEngine;
    this.aiColor = aiColor;
  }

  /**
   * Get the best move for the AI player
   * @returns The move the AI wants to make, or null if no valid moves
   */
  getBestMove(): Move | null {
    const gameState = this.gameEngine.getGameState();

    // Always use the same move generation logic - getValidMovesForPlayer handles
    // both normal moves and sequential jump moves correctly
    const validMoves = getValidMovesForPlayer(
      gameState.board,
      this.aiColor,
      gameState.currentJumpingPiece
    );

    if (validMoves.length === 0) {
      return null;
    }

    // Separate capture moves from regular moves
    const captureMoves = validMoves.filter(move => move.isCapture);
    const regularMoves = validMoves.filter(move => !move.isCapture);

    // If there are capture moves, prioritize them
    if (captureMoves.length > 0) {
      return this.selectBestCaptureMove(captureMoves, gameState);
    }

    // If no capture moves, select from regular moves
    if (regularMoves.length > 0) {
      return this.selectRandomMove(regularMoves);
    }

    // Fallback (shouldn't happen due to validation above)
    return validMoves[0];
  }

  /**
   * Select the best capture move from available capture moves
   * Prioritizes sequential jumps over single jumps
   */
  private selectBestCaptureMove(
    captureMoves: Move[],
    gameState: GameState
  ): Move {
    // Use the utility function to get sequential jump moves
    const sequentialJumpMoves = getSequentialJumpMoves(gameState, this.aiColor);

    if (sequentialJumpMoves.length > 0) {
      // Prioritize sequential jumps
      return this.selectRandomMove(sequentialJumpMoves);
    }

    // If no sequential jumps, select from single capture moves
    return this.selectRandomMove(captureMoves);
  }

  /**
   * Select a random move from the given array of moves
   */
  private selectRandomMove(moves: Move[]): Move {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  /**
   * Execute the AI's move
   * @returns true if move was successful, false otherwise
   */
  makeMove(): boolean {
    const move = this.getBestMove();

    if (!move) {
      return false;
    }

    return this.gameEngine.executeMove(move);
  }

  /**
   * Check if it's the AI's turn
   */
  isAITurn(): boolean {
    return this.gameEngine.getCurrentPlayer() === this.aiColor;
  }

  /**
   * Get the AI's color
   */
  getAIColor(): PieceColor {
    return this.aiColor;
  }

  /**
   * Update the game engine reference (useful when game state changes)
   */
  updateGameEngine(gameEngine: GameRulesEngine): void {
    this.gameEngine = gameEngine;
  }
}

/**
 * Factory function to create an AI player
 */
export function createCheckersAI(
  gameEngine: GameRulesEngine,
  aiColor: PieceColor
): CheckersAI {
  return new CheckersAI(gameEngine, aiColor);
}

/**
 * Get all possible sequential jump moves for a player
 */
export function getSequentialJumpMoves(
  gameState: GameState,
  playerColor: PieceColor
): Move[] {
  const validMoves = getValidMovesForPlayer(gameState.board, playerColor);

  return validMoves.filter(move => {
    if (!move.isCapture) return false;

    // Check if this move can lead to more jumps
    const jumpSequences = findJumpSequences(
      gameState.board,
      move.piece,
      move.to
    );
    return jumpSequences.some(sequence => sequence.length > 1);
  });
}
