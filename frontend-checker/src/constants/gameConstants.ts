// Game Configuration Constants
export const GAME_CONFIG = {
  BOARD_SIZE: 8,
  PIECES_PER_PLAYER: 12,
  LIGHT_PIECE_ROWS: 3, // Top 3 rows for light pieces
  DARK_PIECE_ROWS: 3, // Bottom 3 rows for dark pieces
  BOARD_WIDTH: 800,
  BOARD_HEIGHT: 800,
  MAX_WIDTH: 800,
  // Responsive sizing
  MIN_BOARD_SIZE: 400,
  MAX_BOARD_SIZE: 1000,
  BOARD_SIZE_RATIO: 0.8, // 80% of viewport width/height
} as const;

// Board Layout Constants
export const BOARD_LAYOUT = {
  LIGHT_SQUARE_PATTERN: 0, // (row + col) % 2 === 0
  DARK_SQUARE_PATTERN: 1, // (row + col) % 2 === 1
  LIGHT_PIECE_START_ROW: 0,
  LIGHT_PIECE_END_ROW: 2,
  DARK_PIECE_START_ROW: 5,
  DARK_PIECE_END_ROW: 7,
  KING_ROW_LIGHT: 0,
  KING_ROW_DARK: 7,
} as const;

// Game Rules Constants
export const GAME_RULES = {
  CAPTURE_DISTANCE: 2,
  REGULAR_MOVE_DISTANCE: 1,
  MANDATORY_CAPTURE: true,
  KING_MOVEMENT: 'allDirections',
  MULTIPLE_JUMPS: true,
} as const;

// UI Constants
export const UI_CONFIG = {
  BORDER_WIDTH: 2,
  SQUARE_BORDER_WIDTH: 1,
  HOVER_SCALE: 1.05,
  TRANSITION_DURATION: 0.15,
  MIN_HEIGHT: '100vh',
  GAP_LARGE: '24px',
  GAP_MEDIUM: '16px',
  GAP_SMALL: '8px',
  // Responsive breakpoints (desktop/laptop only)
  BREAKPOINTS: {
    DESKTOP: '1024px',
    LARGE_DESKTOP: '1440px',
  },
} as const;

// Piece Movement Constants
export const MOVEMENT = {
  DIAGONAL_DIRECTIONS: [
    { row: -1, col: -1 }, // Up-left
    { row: -1, col: 1 }, // Up-right
    { row: 1, col: -1 }, // Down-left
    { row: 1, col: 1 }, // Down-right
  ],
  LIGHT_PIECE_DIRECTIONS: [
    { row: 1, col: -1 }, // Up-left
    { row: 1, col: 1 }, // Up-right
  ],
  DARK_PIECE_DIRECTIONS: [
    { row: -1, col: -1 }, // Down-left
    { row: -1, col: 1 }, // Down-right
  ],
};

// Game State Constants
export const GAME_STATE = {
  INITIAL_MOVE_COUNT: 0,
  INITIAL_GAME_TIME: 0,
  INITIAL_CAPTURES: 0,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FAILED_TO_SELECT_PIECE: 'Failed to select piece',
  FAILED_TO_MAKE_MOVE: 'Failed to make move',
  FAILED_TO_START_GAME: 'Failed to start game',
  INVALID_POSITION: 'Invalid position',
  INVALID_MOVE: 'Invalid move',
  PIECE_NOT_FOUND: 'Piece not found',
} as const;

// Console Messages
export const CONSOLE_MESSAGES = {
  RENDERED_SQUARES: (count: number) => `Rendered ${count} squares`,
  CLICKED_SQUARE: (row: number, col: number) => `Clicked square ${row},${col}`,
} as const;

// Text Constants
export const TEXT = {
  GAME_TITLE: 'Checkers Game',
  GAME_INSTRUCTIONS: 'Click and drag pieces to move them',
  PLAYER_1_LABEL: 'Player 1 (Light)',
  PLAYER_2_LABEL: 'Player 2 (Dark)',
  PIECES_LABEL: 'Pieces:',
  VS_LABEL: 'VS',
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_ROW: 0,
  MIN_COL: 0,
  MAX_ROW: GAME_CONFIG.BOARD_SIZE - 1,
  MAX_COL: GAME_CONFIG.BOARD_SIZE - 1,
} as const;
