import { useState, useCallback, useReducer, useEffect, useRef } from 'react';
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
import { CheckersAI, createCheckersAI } from '../utils/ai';

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

      // Check if we're in AI vs Human mode and the last move was made by AI
      const isAIVsHuman = state.gameMode === 'human-vs-ai';
      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      const lastMoveWasByAI =
        isAIVsHuman &&
        state.players.dark.isAI &&
        lastMove.piece.color === PieceColor.DARK;

      // Determine how many moves to undo
      let movesToUndo = 1;
      if (lastMoveWasByAI && state.moveHistory.length >= 2) {
        // In AI vs Human mode, if the last move was by AI, undo both AI and human moves
        movesToUndo = 2;
      }

      // Create a new board state by reversing the moves
      let newBoard = { ...state.board };
      let newPlayers = { ...state.players };
      let newStats = { ...state.stats };
      let newMoveHistory = [...state.moveHistory];

      // Undo the specified number of moves
      for (let i = 0; i < movesToUndo; i++) {
        if (newMoveHistory.length === 0) break;

        const moveToUndo = newMoveHistory[newMoveHistory.length - 1];

        // Move the piece back to its original position
        const pieceToMoveBack = {
          ...moveToUndo.piece,
          position: moveToUndo.from,
        };
        newBoard = setPieceAt(newBoard, moveToUndo.to, null);
        newBoard = setPieceAt(newBoard, moveToUndo.from, pieceToMoveBack);

        // If there was a captured piece, restore it
        if (moveToUndo.capturedPiece) {
          newBoard = setPieceAt(
            newBoard,
            moveToUndo.capturedPiece.position,
            moveToUndo.capturedPiece
          );
        }

        // If the piece was kinged, revert it back to a regular piece
        if (moveToUndo.isKinging) {
          const revertedPiece = { ...pieceToMoveBack, isKing: false };
          newBoard = setPieceAt(newBoard, moveToUndo.from, revertedPiece);
        }

        // Update capture counts
        const capturingPlayer =
          moveToUndo.piece.color === PieceColor.LIGHT ? 'light' : 'dark';
        const capturedPlayer =
          moveToUndo.piece.color === PieceColor.LIGHT ? 'dark' : 'light';

        if (moveToUndo.capturedPiece) {
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
        newStats.moveCount = Math.max(0, newStats.moveCount - 1);
        if (moveToUndo.capturedPiece) {
          newStats.captures[capturingPlayer] = Math.max(
            0,
            newStats.captures[capturingPlayer] - 1
          );
        }

        // Remove the move from history
        newMoveHistory = newMoveHistory.slice(0, -1);
      }

      // Determine the current player after undo
      // If we undid multiple moves, we want to go back to the human player's turn
      let currentPlayer: PieceColor;
      if (lastMoveWasByAI && movesToUndo === 2) {
        // After undoing AI + human moves, it should be the human's turn again
        currentPlayer = PieceColor.LIGHT; // Human is always light player
      } else {
        // Normal undo - go back to the player who made the move we undid
        currentPlayer = lastMove.piece.color;
      }

      // Update player active states
      newPlayers.light.isActive = currentPlayer === PieceColor.LIGHT;
      newPlayers.dark.isActive = currentPlayer === PieceColor.DARK;

      return {
        ...state,
        board: newBoard,
        currentPlayer,
        players: newPlayers,
        stats: newStats,
        moveHistory: newMoveHistory,
        currentJumpingPiece: null, // Clear any jumping piece state
        selectedPiece: null,
        validMoves: [],
        highlightedSquares: [],
      };

    case 'SWITCH_GAME_MODE':
      return {
        ...state,
        gameMode: action.mode,
        // Update player AI status based on new mode
        players: {
          ...state.players,
          light: {
            ...state.players.light,
            isAI: false, // Light player is always human
          },
          dark: {
            ...state.players.dark,
            isAI: action.mode === 'human-vs-ai', // Dark player is AI only in AI mode
          },
        },
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

  // AI reference - persists across renders
  const aiRef = useRef<CheckersAI | null>(null);

  // Initialize AI when game mode changes to HUMAN_VS_AI
  useEffect(() => {
    if (
      gameState.gameMode === 'human-vs-ai' &&
      gameState.gameStatus === GameStatus.PLAYING
    ) {
      // AI always plays as DARK (second player)
      const engine = createGameRulesEngine(gameState);
      aiRef.current = createCheckersAI(engine, PieceColor.DARK);
    } else {
      aiRef.current = null;
    }
  }, [gameState.gameMode, gameState.gameStatus]);

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

  // AI move execution - trigger AI move after human move and turn switch
  useEffect(() => {
    if (
      aiRef.current &&
      gameState.gameMode === 'human-vs-ai' &&
      gameState.gameStatus === GameStatus.PLAYING &&
      gameState.currentPlayer === aiRef.current.getAIColor() &&
      !isLoading
    ) {
      // Execute AI move after a short delay for better UX
      const aiMoveTimeout = setTimeout(() => {
        try {
          setIsLoading(true);

          // Update AI's game engine with current state
          const engine = createGameRulesEngine(gameState);
          aiRef.current!.updateGameEngine(engine);

          // Execute AI moves until the sequence is complete
          let moveExecuted = true;
          let moveCount = 0;
          const maxMoves = 10; // Safety limit to prevent infinite loops

          while (moveExecuted && moveCount < maxMoves) {
            // Get the AI's move using the updated engine
            const aiMove = aiRef.current!.getBestMove();

            if (aiMove) {
              // Execute the move directly on the engine
              moveExecuted = engine.executeMove(aiMove);

              if (moveExecuted) {
                // Get the updated game state from the engine
                const newGameState = engine.getGameState();

                // Dispatch the AI move
                dispatch({
                  type: 'MAKE_MOVE',
                  move: aiMove,
                  newGameState,
                });

                // Check if game is over
                if (isGameOver(newGameState)) {
                  dispatch({
                    type: 'END_GAME',
                    result: newGameState.gameResult,
                  });
                  break;
                }

                // Update the AI's engine with the new state
                aiRef.current!.updateGameEngine(engine);

                // Check if there are more jumps available (sequential jump)
                if (newGameState.currentJumpingPiece) {
                  moveCount++;
                  // Continue the loop to make the next jump
                } else {
                  // No more jumps, sequence is complete
                  break;
                }
              } else {
                console.warn('AI move execution failed');
                break;
              }
            } else {
              console.warn('AI could not find a valid move');
              break;
            }
          }

          if (moveCount >= maxMoves) {
            console.warn('AI move sequence exceeded safety limit');
          }
        } catch (err) {
          console.error('AI move error:', err);
          setError(err instanceof Error ? err.message : 'AI move failed');
        } finally {
          setIsLoading(false);
        }
      }, 500); // 500ms delay for better user experience

      return () => clearTimeout(aiMoveTimeout);
    }
  }, [
    gameState.currentPlayer,
    gameState.gameStatus,
    gameState.gameMode,
    isLoading,
  ]);

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

  const switchGameMode = useCallback((mode: GameMode) => {
    dispatch({ type: 'SWITCH_GAME_MODE', mode });
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

  // AI utility functions
  const isAITurn = useCallback(() => {
    return aiRef.current?.isAITurn() || false;
  }, [gameState.currentPlayer]);

  const getAIColor = useCallback(() => {
    return aiRef.current?.getAIColor() || null;
  }, []);

  const isAIGame = useCallback(() => {
    return gameState.gameMode === 'human-vs-ai';
  }, [gameState.gameMode]);

  return {
    gameState,
    actions: {
      selectPiece,
      deselectPiece,
      makeMove,
      startGame,
      switchGameMode,
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
    ai: {
      isAITurn,
      getAIColor,
      isAIGame,
    },
    isLoading,
    error,
  };
};
