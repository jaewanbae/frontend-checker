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
import { initializeBoard, setPieceAt } from '../utils/gameLogic';
import { getValidMovesForPlayer } from '../utils/moveValidation';
import {
  createGameRulesEngine,
  getGameStatusMessage,
  isGameOver,
  isPlayerTurn,
} from '../utils/gameRules';

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
    currentJumpingPiece: null,
  };
};

// Game state reducer
const gameStateReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_PIECE':
      // Get all valid moves for the current player (enforces mandatory capture rule)
      const allValidMoves = getValidMovesForPlayer(
        state.board,
        state.currentPlayer,
        state.currentJumpingPiece
      );

      // Filter to only moves from the selected piece
      const validMoves = allValidMoves
        .filter(move => move.piece.id === action.piece.id)
        .map(move => move.to);

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
      // Use the new game state from the engine (move history is already updated by the engine)
      return {
        ...action.newGameState,
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
      const newPlayer =
        state.currentPlayer === PieceColor.LIGHT
          ? PieceColor.DARK
          : PieceColor.LIGHT;
      return {
        ...state,
        currentPlayer: newPlayer,
        players: {
          light: {
            ...state.players.light,
            isActive: newPlayer === PieceColor.LIGHT,
          },
          dark: {
            ...state.players.dark,
            isActive: newPlayer === PieceColor.DARK,
          },
        },
      };

    case 'RESET_GAME':
      return createInitialGameState();

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

    case 'UNDO_MOVE':
      if (state.moveHistory.length === 0) {
        return state; // No moves to undo
      }

      // Get the last move
      const lastMove = state.moveHistory[state.moveHistory.length - 1];

      console.log(lastMove, 'PETERBAE');
      // Create a new board state by reversing the last move
      let newBoard = { ...state.board };

      // Move the piece back to its original position
      const pieceToMoveBack = { ...lastMove.piece, position: lastMove.from };
      newBoard = setPieceAt(newBoard, lastMove.to, null);
      newBoard = setPieceAt(newBoard, lastMove.from, pieceToMoveBack);

      // If there was a captured piece, restore it
      if (lastMove.capturedPiece) {
        newBoard = setPieceAt(
          newBoard,
          lastMove.capturedPiece.position,
          lastMove.capturedPiece
        );
      }

      // If the piece was kinged, revert it back to a regular piece
      let revertedPiece = pieceToMoveBack;
      if (lastMove.isKinging) {
        revertedPiece = { ...pieceToMoveBack, isKing: false };
        newBoard = setPieceAt(newBoard, lastMove.from, revertedPiece);
      }

      // Update capture counts
      const capturingPlayer =
        lastMove.piece.color === PieceColor.LIGHT ? 'light' : 'dark';
      const capturedPlayer =
        lastMove.piece.color === PieceColor.LIGHT ? 'dark' : 'light';

      const newPlayers = { ...state.players };
      if (lastMove.capturedPiece) {
        newPlayers[capturingPlayer].captures = Math.max(
          0,
          newPlayers[capturingPlayer].captures - 1
        );
        newPlayers[capturedPlayer].piecesRemaining = Math.min(
          GAME_CONFIG.PIECES_PER_PLAYER,
          newPlayers[capturedPlayer].piecesRemaining + 1
        );
      }

      // Update stats
      const newStats = { ...state.stats };
      newStats.moveCount = Math.max(0, newStats.moveCount - 1);
      if (lastMove.capturedPiece) {
        newStats.captures[capturingPlayer] = Math.max(
          0,
          newStats.captures[capturingPlayer] - 1
        );
      }

      // Remove the last move from history
      const newMoveHistory = state.moveHistory.slice(0, -1);

      // Determine the previous player (the one who made the move we're undoing)
      const previousPlayer = lastMove.piece.color;

      // Update player active states
      newPlayers.light.isActive = previousPlayer === PieceColor.LIGHT;
      newPlayers.dark.isActive = previousPlayer === PieceColor.DARK;

      return {
        ...state,
        board: newBoard,
        currentPlayer: previousPlayer,
        players: newPlayers,
        stats: newStats,
        moveHistory: newMoveHistory,
        currentJumpingPiece: null, // Clear any jumping piece state
        selectedPiece: null,
        validMoves: [],
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
    dispatch({ type: 'SELECT_PIECE', piece });
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

  const undoMove = useCallback(() => {
    if (gameState.moveHistory.length === 0) {
      return; // No moves to undo
    }
    dispatch({ type: 'UNDO_MOVE' });
  }, [gameState.moveHistory.length]);

  const startGame = useCallback((mode: GameMode) => {
    dispatch({ type: 'START_GAME', mode });
  }, []);

  const resetGame = useCallback(() => {
    // Clear local storage to ensure completely fresh start
    clearSavedGameState();
    dispatch({ type: 'RESET_GAME' });
    setError(null);
  }, []);

  const highlightMoves = useCallback((positions: Position[]) => {
    dispatch({ type: 'HIGHLIGHT_MOVES', positions });
  }, []);

  const clearHighlights = useCallback(() => {
    dispatch({ type: 'CLEAR_HIGHLIGHTS' });
  }, []);

  const saveGame = useCallback(() => {
    saveGameState(gameState);
  }, [gameState]);

  const loadGame = useCallback(() => {
    const savedState = loadGameState();
    if (savedState) {
      dispatch({ type: 'LOAD_SAVED_GAME', savedState });
    }
  }, []);

  const clearSavedGame = useCallback(() => {
    clearSavedGameState();
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
      highlightMoves,
      clearHighlights,
      saveGame,
      loadGame,
      clearSavedGame,
      undoMove,
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
