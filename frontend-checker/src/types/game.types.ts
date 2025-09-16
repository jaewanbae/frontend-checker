import {
  PieceColor,
  PieceType,
  GameMode,
  GameStatus,
  GameResult,
} from '../constants/gameEnums';

// Re-export enums as types for backward compatibility
export { PieceColor, PieceType, GameMode, GameStatus, GameResult };

// Board position
export interface Position {
  row: number;
  col: number;
}

// Game piece
export interface Piece {
  id: string;
  color: PieceColor;
  type: PieceType;
  position: Position;
  isKing: boolean;
}

// Move types
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isKinging: boolean;
  isCapture: boolean;
  isMultipleJump: boolean;
  timestamp?: number;
  moveNumber?: number;
}

export interface MoveSequence {
  moves: Move[];
  totalCaptures: number;
}

// Game board
export interface Board {
  squares: (Piece | null)[][];
  size: number;
}

// Player information
export interface Player {
  color: PieceColor;
  isAI: boolean;
  piecesRemaining: number;
  captures: number;
  isActive: boolean;
}

// Game statistics
export interface GameStats {
  moveCount: number;
  gameTime: number;
  captures: {
    light: number;
    dark: number;
  };
  lastMove?: Move;
}

// Game state
export interface GameState {
  board: Board;
  currentPlayer: PieceColor;
  players: {
    light: Player;
    dark: Player;
  };
  gameMode: GameMode;
  gameStatus: GameStatus;
  gameResult: GameResult;
  stats: GameStats;
  moveHistory: Move[];
  selectedPiece: Piece | null;
  validMoves: Position[];
  highlightedSquares: Position[];
  currentJumpingPiece: Piece | null;
}

// Drag and drop types for Pragmatic Drag and Drop
export interface DragData {
  pieceId: string;
  fromPosition: Position;
  piece: Piece;
}

export interface DropData {
  position: Position;
  isValidMove: boolean;
}

// AI types
export interface AIMove {
  move: Move;
  score: number;
  depth: number;
}

export interface AIConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  maxDepth: number;
  useMinimax: boolean;
  useAlphaBeta: boolean;
}

// Game events
export type GameEvent =
  | { type: 'PIECE_SELECTED'; piece: Piece }
  | { type: 'PIECE_DESELECTED' }
  | { type: 'MOVE_MADE'; move: Move }
  | { type: 'GAME_STARTED'; mode: GameMode }
  | { type: 'GAME_ENDED'; result: GameResult }
  | { type: 'TURN_CHANGED'; player: PieceColor }
  | { type: 'PIECE_KINGED'; piece: Piece }
  | { type: 'CAPTURE_MADE'; capturedPiece: Piece; capturingPiece: Piece };

// Game actions
export type GameAction =
  | { type: 'SELECT_PIECE'; piece: Piece }
  | { type: 'DESELECT_PIECE' }
  | { type: 'MAKE_MOVE'; move: Move; newGameState: GameState }
  | { type: 'START_GAME'; mode: GameMode }
  | { type: 'END_GAME'; result: GameResult }
  | { type: 'CHANGE_TURN' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_STATS'; stats: Partial<GameStats> }
  | { type: 'HIGHLIGHT_MOVES'; positions: Position[] }
  | { type: 'CLEAR_HIGHLIGHTS' }
  | { type: 'LOAD_SAVED_GAME'; savedState: Partial<GameState> }
  | { type: 'UNDO_MOVE' };

// Hook return types
export interface UseGameStateReturn {
  gameState: GameState;
  actions: {
    selectPiece: (piece: Piece) => void;
    makeMove: (move: Move) => void;
    startGame: (mode: GameMode) => void;
    resetGame: () => void;
  };
  isLoading: boolean;
  error: string | null;
}

// Utility types
export type Direction = 'up-left' | 'up-right' | 'down-left' | 'down-right';
export type ValidationResult = {
  isValid: boolean;
  reason?: string;
  capturedPiece?: Piece;
  isKinging?: boolean;
  isCapture?: boolean;
  isMultipleJump?: boolean;
};

// Theme types (extending styled-components theme)
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      lightSquare: string;
      darkSquare: string;
      lightPiece: string;
      darkPiece: string;
      lightKing: string;
      darkKing: string;
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      danger: string;
      background: string;
      surface: string;
      textPrimary: string;
      textSecondary: string;
      textLight: string;
      hover: string;
      selected: string;
      validMove: string;
      invalidMove: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
    };
    zIndex: {
      dropdown: number;
      modal: number;
      tooltip: number;
    };
  }
}
