import React from 'react';
import styled from 'styled-components';

const SquareContainer = styled.div<{
  isLight: boolean;
  isHighlighted?: boolean;
  isValidMove?: boolean;
  isSelected?: boolean;
}>`
  aspect-ratio: 1;
  background-color: ${({ isLight, theme }) =>
    isLight ? theme.colors.lightSquare : theme.colors.darkSquare};
  border: 1px solid rgba(0, 0, 0, 0.1);

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ isValidMove }) => (isValidMove ? 'pointer' : 'default')};

  position: relative;

  ${({ isHighlighted, theme }) =>
    isHighlighted &&
    `
    background-color: ${theme.colors.hover};
    box-shadow: inset 0 0 0 2px ${theme.colors.secondary};
  `}

  ${({ isValidMove, theme }) =>
    isValidMove &&
    `
    background-color: ${theme.colors.validMove};
    box-shadow: inset 0 0 0 2px ${theme.colors.success};
  `}
  
  ${({ isSelected, theme }) =>
    isSelected &&
    `
    background-color: ${theme.colors.selected};
    box-shadow: inset 0 0 0 3px ${theme.colors.primary};
  `}
  
  &:hover {
    ${({ isValidMove, theme }) =>
      isValidMove &&
      `
      background-color: ${theme.colors.validMove};
      transform: scale(1.05);
    `}
  }

  transition: ${({ theme }) => theme.transitions.fast};
`;

interface SquareProps {
  row: number;
  col: number;
  isLight: boolean;
  isHighlighted?: boolean;
  isValidMove?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Square: React.FC<SquareProps> = ({
  row,
  col,
  isLight,
  isHighlighted = false,
  isValidMove = false,
  isSelected = false,
  onClick,
  children,
}) => {
  return (
    <SquareContainer
      isLight={isLight}
      isHighlighted={isHighlighted}
      isValidMove={isValidMove}
      isSelected={isSelected}
      onClick={onClick}
      data-row={row}
      data-col={col}
    >
      {children}
    </SquareContainer>
  );
};
