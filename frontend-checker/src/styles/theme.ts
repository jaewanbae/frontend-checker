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
    hover: 'rgba(52, 152, 219, 0.1)',
    selected: 'rgba(52, 152, 219, 0.3)',
    validMove: 'rgba(39, 174, 96, 0.3)',
    invalidMove: 'rgba(231, 76, 60, 0.3)',
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
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    xl: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
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
