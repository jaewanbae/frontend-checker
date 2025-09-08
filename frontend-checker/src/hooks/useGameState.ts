import { useState, useCallback, useReducer, useEffect } from 'react';
import {
  GameState,
  GameAction,
  GameMode,
  Piece,
  Move,
  Position,
} from '../types/game.types';
import { GAME_CONFIG, GAME_STATE } from '../constants/gameConstants';
import { PieceColor, GameStatus, GameResult } from '../constants/gameEnums';
import { initializeBoard } from '../utils/gameLogic';
import {
  createGameRulesEngine,
  getGameStatusMessage,
  isGameOver,
  isPlayerTurn,
} from '../utils/gameRules';
import { getValidMovesForPiece } from '../utils/moveValidation';

// Game state persistence keys
const GAME_STATE_KEY = 'checkers-game-state';
const GAME_STATS_KEY = 'checkers-game-stats';

// Save game state to localStorage
const saveGameState = (gameState: GameState): void => {
  try {
    const stateToSave = {
      board: gameState.board,
      currentPlayer: gameState.currentPlayer,
      players: gameState.players,
      gameMode: gameState.gameMode,
      gameStatus: gameState.gameStatus,
      gameResult: gameState.gameResult,
      moveHistory: gameState.moveHistory,
      selectedPiece: gameState.selectedPiece,
      validMoves: gameState.validMoves,
      highlightedSquares: gameState.highlightedSquares,
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
};

// Load game state from localStorage
const loadGameState = (): Partial<GameState> | null => {
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.warn('Failed to load game state:', error);
  }
  return null;
};

// Save game statistics to localStorage
const saveGameStats = (stats: GameState['stats']): void => {
  try {
    localStorage.setItem(GAME_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn('Failed to save game stats:', error);
  }
};

// Load game statistics from localStorage
const loadGameStats = (): GameState['stats'] | null => {
  try {
    const savedStats = localStorage.getItem(GAME_STATS_KEY);
    if (savedStats) {
      return JSON.parse(savedStats);
    }
  } catch (error) {
    console.warn('Failed to load game stats:', error);
  }
  return null;
};

// Clear saved game state
const clearSavedGameState = (): void => {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
    localStorage.removeItem(GAME_STATS_KEY);
  } catch (error) {
    console.warn('Failed to clear saved game state:', error);
  }
};

// Initial game state
const createInitialGameState = (): GameState => {
  const savedStats = loadGameStats();

  return {
    board: initializeBoard(),
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
    stats: savedStats || {
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
  };
};

// Game state reducer
const gameStateReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_PIECE':
      const validMoves = getValidMovesForPiece(state.board, action.piece);
      return {
        ...state,
        selectedPiece: action.piece,
        validMoves: validMoves,
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
      // Use the new game state from the engine and update move history
      return {
        ...action.newGameState,
        moveHistory: [...state.moveHistory, action.move],
        stats: {
          ...action.newGameState.stats,
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

    case 'LOAD_SAVED_GAME':
      return {
        ...state,
        ...action.savedState,
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

  // Load saved game state on component mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState && savedState.gameStatus === GameStatus.PLAYING) {
      // Restore the saved game state
      dispatch({ type: 'LOAD_SAVED_GAME', savedState });
    }
  }, []);

  // Save game state whenever it changes (except for temporary states)
  useEffect(() => {
    if (gameState.gameStatus === GameStatus.PLAYING) {
      saveGameState(gameState);
    }
    saveGameStats(gameState.stats);
  }, [gameState]);

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

  const makeMove = useCallback(
    (move: Move) => {
      try {
        setIsLoading(true);

        // Create game rules engine with current state
        const engine = createGameRulesEngine(gameState);

        // Check if move is legal
        // Move validation is handled by the engine

        // Execute the move (handles both single moves and multiple jump sequences)
        const moveExecuted = engine.executeMove(move);

        if (moveExecuted) {
          // Get the updated game state from the engine
          const newGameState = engine.getGameState();

          // Dispatch the move action with the updated state
          dispatch({
            type: 'MAKE_MOVE',
            move,
            newGameState,
          });

          // Check if game is over
          if (isGameOver(newGameState)) {
            dispatch({ type: 'END_GAME', result: newGameState.gameResult });
          }
        } else {
          setError('Failed to execute move');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to make move');
      } finally {
        setIsLoading(false);
      }
    },
    [gameState]
  );

  const startGame = useCallback((mode: GameMode) => {
    try {
      dispatch({ type: 'START_GAME', mode });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    }
  }, []);

  const resetGame = useCallback(() => {
    // Clear local storage to ensure completely fresh start
    clearSavedGameState();
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

  const saveGame = useCallback(() => {
    try {
      saveGameState(gameState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game');
    }
  }, [gameState]);

  const loadGame = useCallback(() => {
    try {
      const savedState = loadGameState();
      if (savedState) {
        dispatch({ type: 'LOAD_SAVED_GAME', savedState });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    }
  }, []);

  const clearSavedGame = useCallback(() => {
    try {
      clearSavedGameState();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to clear saved game'
      );
    }
  }, []);

  // Game rules utilities
  const getCurrentPlayer = useCallback(() => {
    return gameState.currentPlayer;
  }, [gameState.currentPlayer]);

  const getGameStatusMessageUtil = useCallback(() => {
    return getGameStatusMessage(gameState);
  }, [gameState]);

  const isGameFinished = useCallback(() => {
    return isGameOver(gameState);
  }, [gameState]);

  const isCurrentPlayerTurn = useCallback(
    (playerColor: PieceColor) => {
      return isPlayerTurn(gameState, playerColor);
    },
    [gameState]
  );

  const getValidMovesForCurrentPlayer = useCallback(() => {
    const engine = createGameRulesEngine(gameState);
    return engine.getValidMovesForCurrentPlayer();
  }, [gameState]);

  const getMoveHistory = useCallback(() => {
    return gameState.moveHistory;
  }, [gameState.moveHistory]);

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
      saveGame,
      loadGame,
      clearSavedGame,
    },
    gameRules: {
      getCurrentPlayer,
      getGameStatusMessage: getGameStatusMessageUtil,
      isGameFinished,
      isCurrentPlayerTurn,
      getValidMovesForCurrentPlayer,
      getMoveHistory,
    },
    isLoading,
    error,
  };
};
