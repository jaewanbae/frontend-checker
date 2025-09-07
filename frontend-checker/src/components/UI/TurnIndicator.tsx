import React from 'react';
import styled from 'styled-components';
import { Card, Text } from '../../styles/styledComponents';

const TurnContainer = styled(Card)<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.selected : theme.colors.surface};
  border: 2px solid
    ${({ isActive, theme }) =>
      isActive ? theme.colors.primary : 'transparent'};
  transition: ${({ theme }) => theme.transitions.fast};
`;

const PlayerIcon = styled.div<{ isLight: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ isLight, theme }) =>
    isLight ? theme.colors.lightPiece : theme.colors.darkPiece};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerName = styled(Text)`
  font-weight: 600;
  margin-bottom: 2px;
`;

const PlayerStatus = styled(Text)`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface TurnIndicatorProps {
  player: 'light' | 'dark';
  isActive: boolean;
  isAI?: boolean;
  piecesRemaining: number;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  player,
  isActive,
  isAI = false,
  piecesRemaining,
}) => {
  const playerName = player === 'light' ? 'Light Player' : 'Dark Player';
  const status = isActive
    ? isAI
      ? 'AI is thinking...'
      : 'Your turn'
    : 'Waiting...';

  return (
    <TurnContainer isActive={isActive}>
      <PlayerIcon isLight={player === 'light'} />
      <PlayerInfo>
        <PlayerName>
          {playerName} {isAI && '🤖'}
        </PlayerName>
        <PlayerStatus>
          {status} • {piecesRemaining} pieces
        </PlayerStatus>
      </PlayerInfo>
    </TurnContainer>
  );
};
