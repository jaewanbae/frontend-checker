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
