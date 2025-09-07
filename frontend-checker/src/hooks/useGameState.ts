import { useState, useCallback, useReducer } from 'react';
import {
  GameState,
  GameAction,
  GameMode,
  Piece,
  Move,
  Position,
} from '../types/game.types';
import {
  GAME_CONFIG,
  GAME_STATE,
  ERROR_MESSAGES,
} from '../constants/gameConstants';
import {
  GameActionType,
  PieceColor,
  GameStatus,
  GameResult,
} from '../constants/gameEnums';

// Initial game state
const createInitialGameState = (): GameState => ({
  board: {
    squares: Array(GAME_CONFIG.BOARD_SIZE)
      .fill(null)
      .map(() => Array(GAME_CONFIG.BOARD_SIZE).fill(null)),
    size: GAME_CONFIG.BOARD_SIZE,
  },
  currentPlayer: PieceColor.LIGHT,
  players: {
    light: {
      color: PieceColor.LIGHT,
      isAI: false,
      piecesRemaining: GAME_CONFIG.PIECES_PER_PLAYER,
      captures: GAME_STATE.INITIAL_CAPTURES,
      isActive: true,
    },
    dark: {
      color: PieceColor.DARK,
      isAI: false,
      piecesRemaining: GAME_CONFIG.PIECES_PER_PLAYER,
      captures: GAME_STATE.INITIAL_CAPTURES,
      isActive: false,
    },
  },
  gameMode: GameMode.HUMAN_VS_HUMAN,
  gameStatus: GameStatus.WAITING,
  gameResult: GameResult.NONE,
  stats: {
    moveCount: GAME_STATE.INITIAL_MOVE_COUNT,
    gameTime: GAME_STATE.INITIAL_GAME_TIME,
    captures: {
      light: GAME_STATE.INITIAL_CAPTURES,
      dark: GAME_STATE.INITIAL_CAPTURES,
    },
  },
  moveHistory: [],
  selectedPiece: null,
  validMoves: [],
  highlightedSquares: [],
});

// Game state reducer
const gameStateReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_PIECE':
      return {
        ...state,
        selectedPiece: action.piece,
        validMoves: [], // Will be calculated by game logic
        highlightedSquares: [action.piece.position],
      };

    case 'DESELECT_PIECE':
      return {
        ...state,
        selectedPiece: null,
        validMoves: [],
        highlightedSquares: [],
      };

    case 'MAKE_MOVE':
      // This will be implemented with proper game logic
      return {
        ...state,
        moveHistory: [...state.moveHistory, action.move],
        stats: {
          ...state.stats,
          moveCount: state.stats.moveCount + 1,
          lastMove: action.move,
        },
        selectedPiece: null,
        validMoves: [],
        highlightedSquares: [],
      };

    case 'START_GAME':
      return {
        ...state,
        gameMode: action.mode,
        gameStatus: GameStatus.PLAYING,
        players: {
          ...state.players,
          dark: {
            ...state.players.dark,
            isAI: action.mode === 'human-vs-ai',
          },
        },
      };

    case 'END_GAME':
      return {
        ...state,
        gameStatus: GameStatus.FINISHED,
        gameResult: action.result,
      };

    case 'CHANGE_TURN':
      return {
        ...state,
        currentPlayer:
          state.currentPlayer === PieceColor.LIGHT
            ? PieceColor.DARK
            : PieceColor.LIGHT,
        players: {
          light: {
            ...state.players.light,
            isActive: state.currentPlayer === PieceColor.DARK,
          },
          dark: {
            ...state.players.dark,
            isActive: state.currentPlayer === PieceColor.LIGHT,
          },
        },
      };

    case 'RESET_GAME':
      return createInitialGameState();

    case 'PAUSE_GAME':
      return {
        ...state,
        gameStatus: GameStatus.PAUSED,
      };

    case 'RESUME_GAME':
      return {
        ...state,
        gameStatus: GameStatus.PLAYING,
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.stats },
      };

    case 'HIGHLIGHT_MOVES':
      return {
        ...state,
        highlightedSquares: action.positions,
      };

    case 'CLEAR_HIGHLIGHTS':
      return {
        ...state,
        highlightedSquares: [],
      };

    default:
      return state;
  }
};

export const useGameState = () => {
  const [gameState, dispatch] = useReducer(
    gameStateReducer,
    createInitialGameState()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectPiece = useCallback((piece: Piece) => {
    try {
      dispatch({ type: 'SELECT_PIECE', piece });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select piece');
    }
  }, []);

  const deselectPiece = useCallback(() => {
    dispatch({ type: 'DESELECT_PIECE' });
  }, []);

  const makeMove = useCallback((move: Move) => {
    try {
      setIsLoading(true);
      dispatch({ type: 'MAKE_MOVE', move });
      dispatch({ type: 'CHANGE_TURN' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make move');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startGame = useCallback((mode: GameMode) => {
    try {
      dispatch({ type: 'START_GAME', mode });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    }
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    setError(null);
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: 'PAUSE_GAME' });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' });
  }, []);

  const highlightMoves = useCallback((positions: Position[]) => {
    dispatch({ type: 'HIGHLIGHT_MOVES', positions });
  }, []);

  const clearHighlights = useCallback(() => {
    dispatch({ type: 'CLEAR_HIGHLIGHTS' });
  }, []);

  return {
    gameState,
    actions: {
      selectPiece,
      deselectPiece,
      makeMove,
      startGame,
      resetGame,
      pauseGame,
      resumeGame,
      highlightMoves,
      clearHighlights,
    },
    isLoading,
    error,
  };
};
