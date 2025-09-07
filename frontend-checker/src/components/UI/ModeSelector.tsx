import React from 'react';
import styled from 'styled-components';
import { Card, Button, Heading, Text } from '../../styles/styledComponents';

const ModeContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 400px;
  margin: 0 auto;
`;

const ModeButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const ModeDescription = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface ModeSelectorProps {
  selectedMode: 'human-vs-human' | 'human-vs-ai';
  onModeChange: (mode: 'human-vs-human' | 'human-vs-ai') => void;
  onStartGame: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  onStartGame,
}) => {
  return (
    <ModeContainer>
      <Heading level={2} align="center">
        Select Game Mode
      </Heading>

      <ModeDescription>Choose how you want to play the game</ModeDescription>

      <ModeButtons>
        <Button
          variant={selectedMode === 'human-vs-human' ? 'primary' : 'secondary'}
          fullWidth
          onClick={() => onModeChange('human-vs-human')}
        >
          👥 Human vs Human
        </Button>

        <Button
          variant={selectedMode === 'human-vs-ai' ? 'primary' : 'secondary'}
          fullWidth
          onClick={() => onModeChange('human-vs-ai')}
        >
          🤖 Human vs AI
        </Button>
      </ModeButtons>

      <Button variant="success" size="lg" fullWidth onClick={onStartGame}>
        Start Game
      </Button>
    </ModeContainer>
  );
};
