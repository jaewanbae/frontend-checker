export const theme = {
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
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },

  shadows: {
    sm: '0 1px 3px #1f1f1f, 0 1px 2px #3d3d3d',
    md: '0 3px 6px #2a2a2a, 0 3px 6px #333333',
    lg: '0 10px 20px #2d2d2d, 0 6px 6px #333333',
    xl: '0 14px 28px #2a2a2a, 0 10px 10px #2d2d2d',
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
} as const;

export type Theme = typeof theme;
