// Shared theme properties
const sharedTheme = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },

  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
  },

  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },

  zIndex: {
    dropdown: 1000,
    modal: 1050,
    tooltip: 1100,
  },
};

// Light theme colors
const lightTheme = {
  colors: {
    // Board colors
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',

    // Piece colors
    lightPiece: '#ffffff',
    darkPiece: '#000000',
    lightKing: '#ffd700',
    darkKing: '#8b4513',

    // UI colors
    primary: '#2c3e50',
    secondary: '#3498db',
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c',

    // Background colors
    background: '#f8f9fa',
    surface: '#ffffff',

    // Text colors
    textPrimary: '#2c3e50',
    textSecondary: '#7f8c8d',
    textLight: '#ffffff',

    // Interactive colors
    hover: '#e3f2fd',
    selected: '#bbdefb',
    validMove: '#c8e6c9',
    invalidMove: '#ffcdd2',

    // Additional colors
    border: '#dee2e6',
    light: '#ffffff',
    dark: '#000000',
    error: '#e74c3c',
  },

  shadows: {
    sm: '0 1px 3px #1f00001f, 0 1px 2px #0000003d',
    md: '0 3px 6px #00000029, 0 3px 6px #0000003b',
    lg: '0 10px 20px #00000030, 0 6px 6px #0000003b',
    xl: '0 14px 28px #00000040, 0 10px 10px #00000038',
  },

  ...sharedTheme,
};

// Dark theme colors
const darkTheme = {
  colors: {
    // Board colors - adjusted for dark mode
    lightSquare: '#d4af8c',
    darkSquare: '#8b6f47',

    // Piece colors - enhanced contrast for dark mode
    lightPiece: '#f5f5f5',
    darkPiece: '#1a1a1a',
    lightKing: '#ffd700',
    darkKing: '#cd853f',

    // UI colors - adjusted for dark mode
    primary: '#4a90e2',
    secondary: '#5dade2',
    success: '#58d68d',
    warning: '#f7dc6f',
    danger: '#ec7063',

    // Background colors - dark theme
    background: '#1a1a1a',
    surface: '#2d2d2d',

    // Text colors - light text for dark backgrounds
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textLight: '#ffffff',

    // Interactive colors - adjusted for dark mode
    hover: '#3a3a3a',
    selected: '#4a4a4a',
    validMove: '#2d5a2d',
    invalidMove: '#5a2d2d',

    // Additional colors
    border: '#404040',
    light: '#ffffff',
    dark: '#000000',
    error: '#ec7063',
  },

  shadows: {
    sm: '0 1px 3px #0000004d, 0 1px 2px #00000066',
    md: '0 3px 6px #00000066, 0 3px 6px #00000080',
    lg: '0 10px 20px #00000080, 0 6px 6px #00000099',
    xl: '0 14px 28px #00000099, 0 10px 10px #000000b3',
  },

  ...sharedTheme,
};

// Theme type
export type Theme = typeof lightTheme;

// Theme variants
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
