import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../styles/ThemeProvider';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-1px);
  }
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  position: relative;
  width: 50px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.primary : theme.colors.border};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  outline: none;

  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.secondary};
  }

  &:hover {
    background-color: ${({ isActive, theme }) =>
      isActive ? theme.colors.secondary : theme.colors.textSecondary};
  }
`;

const ToggleSlider = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ isActive }) => (isActive ? '26px' : '2px')};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  user-select: none;
`;

interface ThemeToggleProps {
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = true,
}) => {
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <ToggleContainer>
      {showLabel && <ToggleLabel>{isDark ? 'Dark' : 'Light'}</ToggleLabel>}
      <ToggleButton
        isActive={isDark}
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <ToggleSlider isActive={isDark}>{isDark ? '🌙' : '☀️'}</ToggleSlider>
      </ToggleButton>
    </ToggleContainer>
  );
};

export default ThemeToggle;
