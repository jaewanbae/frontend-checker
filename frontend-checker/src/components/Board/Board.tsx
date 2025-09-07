import React from 'react';
import styled from 'styled-components';
import { GAME_CONFIG, UI_CONFIG } from '../../constants/gameConstants';

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr);
  grid-template-rows: repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr);
  width: ${GAME_CONFIG.BOARD_WIDTH}px;
  height: ${GAME_CONFIG.BOARD_HEIGHT}px;
  border: ${UI_CONFIG.BORDER_WIDTH}px solid
    ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  background-color: ${({ theme }) => theme.colors.surface};
`;

interface BoardProps {
  children?: React.ReactNode;
}

export const Board: React.FC<BoardProps> = ({ children }) => {
  return <BoardContainer>{children}</BoardContainer>;
};
