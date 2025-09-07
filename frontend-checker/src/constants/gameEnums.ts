// Game Enums
export enum PieceColor {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum PieceType {
  PAWN = 'pawn',
  KING = 'king',
}

export enum GameMode {
  HUMAN_VS_HUMAN = 'human-vs-human',
  HUMAN_VS_AI = 'human-vs-ai',
}

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

export enum GameResult {
  LIGHT_WINS = 'light-wins',
  DARK_WINS = 'dark-wins',
  DRAW = 'draw',
  NONE = 'none',
}

export enum GameActionType {
  SELECT_PIECE = 'SELECT_PIECE',
  DESELECT_PIECE = 'DESELECT_PIECE',
  MAKE_MOVE = 'MAKE_MOVE',
  START_GAME = 'START_GAME',
  END_GAME = 'END_GAME',
  CHANGE_TURN = 'CHANGE_TURN',
  RESET_GAME = 'RESET_GAME',
  PAUSE_GAME = 'PAUSE_GAME',
  RESUME_GAME = 'RESUME_GAME',
  UPDATE_STATS = 'UPDATE_STATS',
  HIGHLIGHT_MOVES = 'HIGHLIGHT_MOVES',
  CLEAR_HIGHLIGHTS = 'CLEAR_HIGHLIGHTS',
}

export enum Direction {
  UP_LEFT = 'up-left',
  UP_RIGHT = 'up-right',
  DOWN_LEFT = 'down-left',
  DOWN_RIGHT = 'down-right',
}

export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
}

export enum ButtonSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}

export enum TextSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}

export enum TextWeight {
  NORMAL = 'normal',
  MEDIUM = 'medium',
  SEMIBOLD = 'semibold',
  BOLD = 'bold',
}

export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export enum FlexDirection {
  ROW = 'row',
  COLUMN = 'column',
}

export enum JustifyContent {
  FLEX_START = 'flex-start',
  CENTER = 'center',
  FLEX_END = 'flex-end',
  SPACE_BETWEEN = 'space-between',
  SPACE_AROUND = 'space-around',
}

export enum AlignItems {
  FLEX_START = 'flex-start',
  CENTER = 'center',
  FLEX_END = 'flex-end',
  STRETCH = 'stretch',
}

export enum FlexWrap {
  WRAP = 'wrap',
  NOWRAP = 'nowrap',
}

export enum ShadowSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
  EXTRA_LARGE = 'xl',
}

export enum BorderRadius {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
  EXTRA_LARGE = 'xl',
  FULL = 'full',
}

export enum Spacing {
  EXTRA_SMALL = 'xs',
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
  EXTRA_LARGE = 'xl',
  EXTRA_EXTRA_LARGE = 'xxl',
}

export enum Breakpoint {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  WIDE = 'wide',
}

export enum ZIndex {
  DROPDOWN = 1000,
  MODAL = 1050,
  TOOLTIP = 1100,
}

export enum TransitionSpeed {
  FAST = 'fast',
  NORMAL = 'normal',
  SLOW = 'slow',
}
