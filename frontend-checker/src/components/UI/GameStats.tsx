import React from 'react';
import styled from 'styled-components';
import { Card, Text } from '../../styles/styledComponents';

const StatsContainer = styled(Card)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled(Text)`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface GameStatsProps {
  currentPlayer: 'light' | 'dark';
  lightPieces: number;
  darkPieces: number;
  moveCount: number;
  gameTime: number;
  captures: {
    light: number;
    dark: number;
  };
}

export const GameStats: React.FC<GameStatsProps> = ({
  currentPlayer,
  lightPieces,
  darkPieces,
  moveCount,
  gameTime,
  captures,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <StatsContainer>
      <StatItem>
        <StatValue>{currentPlayer === 'light' ? 'Light' : 'Dark'}</StatValue>
        <StatLabel>Current Player</StatLabel>
      </StatItem>

      <StatItem>
        <StatValue>{lightPieces}</StatValue>
        <StatLabel>Light Pieces</StatLabel>
      </StatItem>

      <StatItem>
        <StatValue>{darkPieces}</StatValue>
        <StatLabel>Dark Pieces</StatLabel>
      </StatItem>

      <StatItem>
        <StatValue>{moveCount}</StatValue>
        <StatLabel>Moves</StatLabel>
      </StatItem>

      <StatItem>
        <StatValue>{formatTime(gameTime)}</StatValue>
        <StatLabel>Game Time</StatLabel>
      </StatItem>

      <StatItem>
        <StatValue>{captures.light + captures.dark}</StatValue>
        <StatLabel>Total Captures</StatLabel>
      </StatItem>
    </StatsContainer>
  );
};
