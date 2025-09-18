// Responsive breakpoints
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  largeDesktop: '1440px',
  // Height-based breakpoints for small screens
  height900: '900px',
  height800: '800px',
  height700: '700px',
  height600: '600px',
} as const;

// Responsive utility functions
export const responsive = {
  // Media query helpers
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
  largeDesktop: `@media (max-width: ${breakpoints.largeDesktop})`,

  // Height-based media queries
  height900: `@media (max-height: ${breakpoints.height900})`,
  height800: `@media (max-height: ${breakpoints.height800})`,
  height700: `@media (max-height: ${breakpoints.height700})`,
  height600: `@media (max-height: ${breakpoints.height600})`,

  // Responsive sizing helpers
  boardSize: {
    base: 'min(60vw, 50vh)',
    height900: 'min(65vw, 45vh, 500px)',
    height800: 'min(70vw, 40vh, 450px)',
    height700: 'min(75vw, 35vh, 400px)',
    height600: 'min(80vw, 30vh, 350px)',
  },

  // Responsive font size helpers
  fontSize: {
    base: '1rem',
    height800: '0.9rem',
    height700: '0.8rem',
    height600: '0.7rem',
  },

  // Responsive padding helpers
  padding: {
    base: '16px',
    height800: '8px',
    height700: '4px',
    height600: '2px',
  },
};

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

  // Add responsive utilities to theme
  responsive,
  breakpoints,
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

// Extend styled-components DefaultTheme
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

// Theme variants
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
