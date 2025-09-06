import styled from 'styled-components';
import { Theme } from './theme';

// Container components
export const Container = styled.div<{ maxWidth?: string; padding?: string }>`
  max-width: ${({ maxWidth }) => maxWidth || '1200px'};
  margin: 0 auto;
  padding: ${({ padding }) => padding || '0 16px'};
`;

export const FlexContainer = styled.div<{
  direction?: 'row' | 'column';
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;
  wrap?: 'wrap' | 'nowrap';
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction || 'row'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  align-items: ${({ align }) => align || 'flex-start'};
  gap: ${({ gap }) => gap || '0'};
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
`;

export const GridContainer = styled.div<{
  columns?: number;
  gap?: string;
  templateColumns?: string;
}>`
  display: grid;
  grid-template-columns: ${({ templateColumns, columns }) =>
    templateColumns || `repeat(${columns || 1}, 1fr)`};
  gap: ${({ gap }) => gap || '0'};
`;

// Button components
export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}>`
  padding: ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg':
        return `${theme.spacing.lg} ${theme.spacing.xl}`;
      default:
        return `${theme.spacing.md} ${theme.spacing.lg}`;
    }
  }};

  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return '0.875rem';
      case 'lg':
        return '1.125rem';
      default:
        return '1rem';
    }
  }};

  transition: ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'danger':
        return theme.colors.danger;
      default:
        return theme.colors.primary;
    }
  }};

  color: ${({ theme }) => theme.colors.textLight};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Card component
export const Card = styled.div<{
  padding?: string;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: string;
}>`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ padding }) => padding || '24px'};
  border-radius: ${({ borderRadius, theme }) =>
    borderRadius || theme.borderRadius.lg};
  box-shadow: ${({ shadow, theme }) => {
    switch (shadow) {
      case 'sm':
        return theme.shadows.sm;
      case 'lg':
        return theme.shadows.lg;
      case 'xl':
        return theme.shadows.xl;
      default:
        return theme.shadows.md;
    }
  }};
`;

// Text components
export const Heading = styled.h1<{
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string;
  align?: 'left' | 'center' | 'right';
}>`
  font-size: ${({ level }) => {
    switch (level) {
      case 1:
        return '2.5rem';
      case 2:
        return '2rem';
      case 3:
        return '1.75rem';
      case 4:
        return '1.5rem';
      case 5:
        return '1.25rem';
      case 6:
        return '1.125rem';
      default:
        return '2.5rem';
    }
  }};
  font-weight: 700;
  color: ${({ color, theme }) => color || theme.colors.textPrimary};
  text-align: ${({ align }) => align || 'left'};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const Text = styled.p<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}>`
  font-size: ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return '0.875rem';
      case 'lg':
        return '1.125rem';
      default:
        return '1rem';
    }
  }};
  font-weight: ${({ weight }) => {
    switch (weight) {
      case 'medium':
        return '500';
      case 'semibold':
        return '600';
      case 'bold':
        return '700';
      default:
        return '400';
    }
  }};
  color: ${({ color, theme }) => color || theme.colors.textPrimary};
  text-align: ${({ align }) => align || 'left'};
  line-height: 1.6;
`;

// Responsive utilities
export const MobileOnly = styled.div`
  display: block;

  @media (min-width: ${({ theme }: { theme: Theme }) =>
      theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const DesktopOnly = styled.div`
  display: none;

  @media (min-width: ${({ theme }: { theme: Theme }) =>
      theme.breakpoints.tablet}) {
    display: block;
  }
`;
