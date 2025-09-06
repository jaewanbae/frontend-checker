import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders checkers game title', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /checkers game/i });
  expect(titleElement).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/welcome to the checkers game/i);
  expect(welcomeElement).toBeInTheDocument();
});
