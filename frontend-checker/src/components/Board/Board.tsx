import React from 'react';
import styled from 'styled-components';

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 600px;
  height: 600px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
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
