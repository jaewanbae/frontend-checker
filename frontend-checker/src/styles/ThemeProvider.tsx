import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components';
import { themes, Theme } from './theme';
import { GlobalStyles } from './GlobalStyles';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Local storage key for theme preference
const THEME_STORAGE_KEY = 'checkers-theme-mode';

// Get system theme preference
const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
};

// Get initial theme from localStorage or system preference
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return getSystemTheme();
  }
  return 'light';
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Single unified ThemeProvider that handles both context and styled-components
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialTheme);
  const currentTheme: Theme = themes[themeMode];

  // Save theme preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);

      // Update document class for CSS-based theming
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(themeMode);
    }
  }, [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if user hasn't manually set a preference
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
          setThemeModeState(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setThemeModeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const value: ThemeContextType = {
    themeMode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StyledComponentsThemeProvider theme={currentTheme}>
        <GlobalStyles theme={currentTheme} />
        {children}
      </StyledComponentsThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
