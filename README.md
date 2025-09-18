# Checkers Game

A modern, interactive checkers game built with React, TypeScript, and styled-components. Features drag-and-drop gameplay, AI opponent, dark/light theme, and comprehensive game logic.

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend-checker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

### Game Modes

- **Human vs Human**: Two players take turns on the same device
- **Human vs AI**: Play against an intelligent AI opponent

### Controls

- **Drag and Drop**: Click and drag pieces to move them
- **Click to Move**: Click a piece, then click a valid destination
- **Undo**: Use the undo button to reverse moves
- **AI Toggle**: Switch between game modes during play

### Game Rules

- Light pieces (top) move first
- Pieces move diagonally forward
- Capture opponent pieces by jumping over them
- Mandatory capture rule: must capture if possible
- Sequential jumps: continue capturing in the same turn
- King pieces can move in any diagonal direction
- Win by capturing all opponent pieces or blocking all moves

## 🛠️ Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`

Launches the test runner in interactive watch mode

- Run all tests: `npm test`
- Run specific test: `npm test -- --testNamePattern="test name"`
- Run tests once: `npm test -- --watchAll=false`

### `npm run build`

Builds the app for production to the `build` folder

- Optimized and minified for deployment
- Ready for hosting on any static file server

### 🎨 Design notes and trade-offs

- Cache based vs move based undo action. Chose to go with move based action based on memory usage and the business logic of the undo (1 move at a time). If the requirement involved being able to revert to a specific moment in time in the move history, cache based may be more effective.
- Not well supported in mobile. To fully support, would need to remove board labels, additional buttons should be hidden in a collapsible menu.
- Undoing moves made by AI reverts moves until its back to the players turn (2+ moves). Not the best in terms of UX but creates the smoothest play experience when playing against AI
