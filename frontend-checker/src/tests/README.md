# Checkers Game Test Suite

This directory contains comprehensive unit and integration tests for the checkers game application.

## Test Structure

### Unit Tests (`utils/`)

- **`gameLogic.test.ts`** - Tests for core game logic utilities
  - Board initialization and manipulation
  - Piece movement and positioning
  - King promotion logic
  - Capture detection
  - Direction calculations

- **`moveValidation.test.ts`** - Tests for move validation logic
  - Move validation rules
  - Valid move generation
  - Capture move detection
  - Jump sequence finding
  - Game over conditions

- **`gameRules.test.ts`** - Tests for game rules engine
  - Game state management
  - Turn management
  - Move execution
  - Win condition detection
  - Game statistics tracking

- **`mandatoryCapture.test.ts`** - Tests for mandatory capture rule
  - Capture enforcement
  - Move filtering based on available captures

- **`sequentialJump.test.ts`** - Tests for sequential jump logic
  - Multiple jump sequences
  - Jumping piece constraints

- **`edgeCases.test.ts`** - Tests for edge cases and error scenarios
  - Boundary conditions
  - Error handling
  - Performance edge cases
  - Invalid input handling

### Integration Tests (`integration/`)

- **`gameFlow.test.ts`** - Tests for complete game flows
  - Full game sessions
  - Game state persistence
  - Undo/redo functionality
  - Game modes
  - Error recovery

### Hook Tests (`hooks/`)

- **`useGameState.test.ts`** - Tests for the main game state hook
  - State management
  - Action dispatching
  - Local storage integration
  - Error handling

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Files

```bash
# Run only game logic tests
npm test -- gameLogic.test.ts

# Run only move validation tests
npm test -- moveValidation.test.ts

# Run only integration tests
npm test -- integration/

# Run only edge case tests
npm test -- edgeCases.test.ts
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## Test Coverage

The test suite covers:

### Core Functionality (100% coverage target)

- ✅ Board initialization and piece placement
- ✅ Piece movement validation
- ✅ Capture logic and mandatory capture rule
- ✅ King promotion
- ✅ Multiple jump sequences
- ✅ Game state management
- ✅ Turn management
- ✅ Win condition detection

### Edge Cases

- ✅ Boundary conditions
- ✅ Invalid input handling
- ✅ Error scenarios
- ✅ Performance edge cases
- ✅ Concurrent operations

### Integration Scenarios

- ✅ Complete game flows
- ✅ Game persistence
- ✅ Undo/redo operations
- ✅ Different game modes
- ✅ Error recovery

## Test Data and Fixtures

### Common Test Pieces

```typescript
const lightPiece: Piece = {
  id: 'light-piece',
  color: PieceColor.LIGHT,
  type: PieceType.PAWN,
  position: { row: 2, col: 2 },
  isKing: false,
};

const darkPiece: Piece = {
  id: 'dark-piece',
  color: PieceColor.DARK,
  type: PieceType.PAWN,
  position: { row: 3, col: 3 },
  isKing: false,
};

const king: Piece = {
  id: 'king',
  color: PieceColor.LIGHT,
  type: PieceType.KING,
  position: { row: 4, col: 4 },
  isKing: true,
};
```

### Common Test Moves

```typescript
const normalMove: Move = {
  from: { row: 2, col: 2 },
  to: { row: 3, col: 3 },
  piece: lightPiece,
  isKinging: false,
  isCapture: false,
  isMultipleJump: false,
};

const captureMove: Move = {
  from: { row: 2, col: 2 },
  to: { row: 4, col: 4 },
  piece: lightPiece,
  capturedPiece: darkPiece,
  isKinging: false,
  isCapture: true,
  isMultipleJump: false,
};
```

## Mocking Strategy

### Game Rules Engine

The game rules engine is mocked in integration tests to isolate the hook logic:

```typescript
const mockEngine = {
  executeMove: jest.fn(),
  getGameState: jest.fn(),
};
```

### Local Storage

Local storage is mocked for persistence tests:

```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
```

## Test Best Practices

### 1. Descriptive Test Names

```typescript
test('should validate normal diagonal move', () => {
  // test implementation
});

test('should reject move to occupied square', () => {
  // test implementation
});
```

### 2. Arrange-Act-Assert Pattern

```typescript
test('should execute valid move', () => {
  // Arrange
  const piece = createTestPiece();
  const move = createTestMove();

  // Act
  const result = executeMove(move);

  // Assert
  expect(result).toBe(true);
});
```

### 3. Test Isolation

Each test is isolated and doesn't depend on other tests:

```typescript
beforeEach(() => {
  board = initializeBoard();
  gameState = createInitialGameState();
});
```

### 4. Edge Case Coverage

Tests cover both happy path and edge cases:

```typescript
test('should handle valid input', () => {
  // happy path
});

test('should handle null input gracefully', () => {
  // edge case
});
```

## Debugging Tests

### Run Single Test

```bash
npm test -- --testNamePattern="should validate normal diagonal move"
```

### Debug Mode

```bash
npm test -- --detectOpenHandles --forceExit
```

### Verbose Output

```bash
npm test -- --verbose
```

## Continuous Integration

The test suite is designed to run in CI environments:

- No external dependencies
- Deterministic results
- Fast execution
- Comprehensive coverage

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Use descriptive test names
3. Include both positive and negative test cases
4. Add edge case tests for new functionality
5. Update this README if adding new test categories

## Performance Considerations

- Tests are designed to run quickly (< 30 seconds total)
- Large board scenarios are tested but with reasonable limits
- Memory usage is monitored in performance tests
- Async operations are properly handled
