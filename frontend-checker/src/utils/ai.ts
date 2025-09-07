import { Board, Move, PieceColor, AIMove, AIConfig } from '../types/game.types';
import { getValidMovesForPlayer } from './moveValidation';
import { promoteToKing, canPromoteToKing } from './gameLogic';

// Default AI configuration
const DEFAULT_AI_CONFIG: AIConfig = {
  difficulty: 'medium',
  maxDepth: 3,
  useMinimax: true,
  useAlphaBeta: true,
};

// Evaluate the current board position
export const evaluateBoard = (
  board: Board,
  playerColor: PieceColor
): number => {
  let score = 0;

  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const piece = board.squares[row][col];
      if (piece) {
        let pieceValue = piece.isKing ? 3 : 1;

        // Add positional bonuses
        if (piece.color === playerColor) {
          // Bonus for pieces closer to the opponent's side
          if (piece.color === 'light') {
            pieceValue += (7 - row) * 0.1;
          } else {
            pieceValue += row * 0.1;
          }

          // Bonus for kings
          if (piece.isKing) {
            pieceValue += 0.5;
          }

          score += pieceValue;
        } else {
          // Penalty for opponent pieces
          score -= pieceValue;
        }
      }
    }
  }

  return score;
};

// Get a random valid move
export const getRandomMove = (board: Board, color: PieceColor): Move | null => {
  const validMoves = getValidMovesForPlayer(board, color);

  if (validMoves.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
};

// Get the best move using minimax algorithm
export const getBestMove = (
  board: Board,
  color: PieceColor,
  config: AIConfig = DEFAULT_AI_CONFIG
): Move | null => {
  if (!config.useMinimax) {
    return getRandomMove(board, color);
  }

  const bestMove = minimax(
    board,
    color,
    config.maxDepth,
    true,
    -Infinity,
    Infinity,
    config
  );
  return bestMove.move;
};

// Minimax algorithm with alpha-beta pruning
const minimax = (
  board: Board,
  playerColor: PieceColor,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  config: AIConfig
): AIMove => {
  // Base case: depth reached or game over
  if (depth === 0) {
    const score = evaluateBoard(board, playerColor);
    return { move: null as any, score, depth: config.maxDepth - depth };
  }

  const currentColor = isMaximizing
    ? playerColor
    : playerColor === PieceColor.LIGHT
      ? PieceColor.DARK
      : PieceColor.LIGHT;
  const validMoves = getValidMovesForPlayer(board, currentColor);

  if (validMoves.length === 0) {
    const score = evaluateBoard(board, playerColor);
    return { move: null as any, score, depth: config.maxDepth - depth };
  }

  let bestMove: Move | null = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of validMoves) {
    // Make the move
    const newBoard = makeMoveOnBoard(board, move);

    // Recursive call
    const result = minimax(
      newBoard,
      playerColor,
      depth - 1,
      !isMaximizing,
      alpha,
      beta,
      config
    );

    // Update best move and score
    if (isMaximizing) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.score);
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, result.score);
    }

    // Alpha-beta pruning
    if (config.useAlphaBeta && beta <= alpha) {
      break;
    }
  }

  return { move: bestMove!, score: bestScore, depth: config.maxDepth - depth };
};

// Make a move on the board (creates a new board state)
const makeMoveOnBoard = (board: Board, move: Move): Board => {
  const newBoard = { ...board, squares: board.squares.map(row => [...row]) };

  // Remove piece from original position
  newBoard.squares[move.from.row][move.from.col] = null;

  // Handle capture
  if (move.capturedPiece) {
    newBoard.squares[move.capturedPiece.position.row][
      move.capturedPiece.position.col
    ] = null;
  }

  // Place piece at new position
  let newPiece = { ...move.piece, position: move.to };

  // Handle kinging
  if (canPromoteToKing(newPiece, move.to)) {
    newPiece = promoteToKing(newPiece);
  }

  newBoard.squares[move.to.row][move.to.col] = newPiece;

  return newBoard;
};

// Get AI move based on difficulty
export const getAIMove = (
  board: Board,
  color: PieceColor,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Move | null => {
  const config: AIConfig = {
    difficulty,
    maxDepth: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 5,
    useMinimax: difficulty !== 'easy',
    useAlphaBeta: difficulty === 'hard',
  };

  return getBestMove(board, color, config);
};

// Check if AI should make a move
export const shouldAIMove = (board: Board, color: PieceColor): boolean => {
  const validMoves = getValidMovesForPlayer(board, color);
  return validMoves.length > 0;
};

// Get AI thinking time (for UI feedback)
export const getAIThinkingTime = (
  difficulty: 'easy' | 'medium' | 'hard'
): number => {
  switch (difficulty) {
    case 'easy':
      return 500 + Math.random() * 1000; // 0.5-1.5 seconds
    case 'medium':
      return 1000 + Math.random() * 2000; // 1-3 seconds
    case 'hard':
      return 2000 + Math.random() * 3000; // 2-5 seconds
    default:
      return 1000;
  }
};

// Analyze the current position
export const analyzePosition = (
  board: Board,
  color: PieceColor
): {
  score: number;
  bestMove: Move | null;
  threats: Move[];
  opportunities: Move[];
} => {
  const score = evaluateBoard(board, color);
  const bestMove = getBestMove(board, color);
  const validMoves = getValidMovesForPlayer(board, color);

  const threats = validMoves.filter(move => move.isCapture);
  const opportunities = validMoves.filter(move => !move.isCapture);

  return {
    score,
    bestMove,
    threats,
    opportunities,
  };
};
