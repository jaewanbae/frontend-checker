import React from 'react';
import styled from 'styled-components';
import { GAME_CONFIG } from '../../constants/gameConstants';

const BoardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing.sm};

  /* Mobile-specific adjustments */
  ${({ theme }) => theme.responsive.mobile} {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const BoardWithLabels = styled.div`
  display: grid;
  grid-template-columns: 30px repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr) 30px;
  grid-template-rows: 30px repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr) 30px;
  width: min(60vw, 50vh, ${GAME_CONFIG.MAX_BOARD_SIZE + 100}px);
  height: min(60vw, 50vh, ${GAME_CONFIG.MAX_BOARD_SIZE + 100}px);
  min-width: ${GAME_CONFIG.MIN_BOARD_SIZE + 100}px;
  min-height: ${GAME_CONFIG.MIN_BOARD_SIZE + 100}px;

  /* Mobile-specific sizing to prevent cutoff */
  ${({ theme }) => theme.responsive.mobile} {
    width: min(80vw, 45vh, ${GAME_CONFIG.MAX_BOARD_SIZE + 100}px);
    height: min(80vw, 45vh, ${GAME_CONFIG.MAX_BOARD_SIZE + 100}px);
    max-width: calc(100vw - ${({ theme }) => theme.spacing.xl});
    max-height: calc(100vh - 250px); /* Leave more space for UI elements */
    min-width: ${GAME_CONFIG.MIN_BOARD_SIZE}px;
    min-height: ${GAME_CONFIG.MIN_BOARD_SIZE}px;
  }
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.sm};
  gap: ${({ theme }) => theme.spacing.xs};
`;

const BoardContainer = styled.div`
  grid-column: 2 / ${GAME_CONFIG.BOARD_SIZE + 2};
  grid-row: 2 / ${GAME_CONFIG.BOARD_SIZE + 2};
  display: grid;
  grid-template-columns: repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr);
  grid-template-rows: repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr);
  width: 100%;
  height: 100%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Label = styled.div<{ isColumn?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.background};
  user-select: none;

  ${({ isColumn }) =>
    isColumn
      ? `
    grid-row: 1;
    grid-row: ${GAME_CONFIG.BOARD_SIZE + 2};
  `
      : `
    grid-column: 1;
    grid-column: ${GAME_CONFIG.BOARD_SIZE + 2};
  `}
`;

interface BoardProps {
  children?: React.ReactNode;
}

export const Board: React.FC<BoardProps> = ({ children }) => {
  // Generate column labels (a-h)
  const columnLabels = Array.from({ length: GAME_CONFIG.BOARD_SIZE }, (_, i) =>
    String.fromCharCode(97 + i)
  );

  // Generate row labels (1-8)
  const rowLabels = Array.from({ length: GAME_CONFIG.BOARD_SIZE }, (_, i) =>
    (GAME_CONFIG.BOARD_SIZE - i).toString()
  );

  return (
    <BoardWrapper>
      <BoardWithLabels>
        {/* Top row labels (a-h) */}
        {columnLabels.map((label, index) => (
          <Label
            key={`top-${label}`}
            isColumn
            style={{
              gridColumn: index + 2,
              gridRow: 1,
            }}
          >
            {label}
          </Label>
        ))}

        {/* Bottom row labels (a-h) */}
        {columnLabels.map((label, index) => (
          <Label
            key={`bottom-${label}`}
            isColumn
            style={{
              gridColumn: index + 2,
              gridRow: GAME_CONFIG.BOARD_SIZE + 2,
            }}
          >
            {label}
          </Label>
        ))}

        {/* Left column labels (1-8) */}
        {rowLabels.map((label, index) => (
          <Label
            key={`left-${label}`}
            style={{
              gridColumn: 1,
              gridRow: index + 2,
            }}
          >
            {label}
          </Label>
        ))}

        {/* Right column labels (1-8) */}
        {rowLabels.map((label, index) => (
          <Label
            key={`right-${label}`}
            style={{
              gridColumn: GAME_CONFIG.BOARD_SIZE + 2,
              gridRow: index + 2,
            }}
          >
            {label}
          </Label>
        ))}

        {/* Main board area */}
        <BoardContainer>{children}</BoardContainer>
      </BoardWithLabels>
    </BoardWrapper>
  );
};
