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

### `npm run eject`

**⚠️ One-way operation - cannot be undone!**
Ejects from Create React App to get full control over build configuration

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Board/          # Game board component
│   ├── GameController/ # Main game controller
│   ├── Piece/          # Individual piece component
│   ├── Square/         # Board square component
│   └── UI/             # UI components (MoveHistory, AIToggle)
├── constants/          # Game constants and enums
├── hooks/              # Custom React hooks
├── styles/             # Styling and theme
├── tests/              # Test files
├── types/              # TypeScript type definitions
└── utils/              # Game logic utilities
```

## 🧪 Testing

The project includes comprehensive tests:

- **Unit Tests**: Game logic, move validation, AI behavior
- **Integration Tests**: Complete game flows
- **Component Tests**: React component behavior

Run tests with:

```bash
npm test
```

## 🎨 Features

- ✅ **Drag & Drop Interface**: Intuitive piece movement
- ✅ **AI Opponent**: Smart AI with capture prioritization
- ✅ **Dark/Light Theme**: Toggle between themes
- ✅ **Move History**: Track and undo moves
- ✅ **Game Statistics**: Capture counts and move tracking
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **TypeScript**: Full type safety
- ✅ **Comprehensive Testing**: 160+ test cases

## 🔧 Technical Details

- **Framework**: React 18 with TypeScript
- **Styling**: Styled-components with theme system
- **Drag & Drop**: @atlaskit/pragmatic-drag-and-drop
- **Testing**: Jest + React Testing Library
- **Build Tool**: Create React App

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
