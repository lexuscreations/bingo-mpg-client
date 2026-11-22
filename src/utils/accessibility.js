// Keyboard key codes
export const KEYS = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
};

// ARIA labels and roles
export const ARIA_LABELS = {
  board: "Bingo board",
  cell: (number) => `Cell ${number}`,
  marked: (number) => `Marked number ${number}`,
  winner: (name) => `${name} has won the game!`,
};

// Focus management
export const focusFirstElement = (containerRef) => {
  const firstFocusable = containerRef.current?.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  firstFocusable?.focus();
};

// Notification messages
export const MESSAGES = {
  COPIED: "Room code copied to clipboard!",
  TURN_START: "It's your turn!",
  TURN_END: "Waiting for opponent...",
  WIN: "Congratulations! You won!",
  LOSE: "Game Over! Better luck next time!",
  PLAYER_JOINED: "Player joined the game!",
  PLAYER_LEFT: "Player left the game",
  LINE_COMPLETE: "Line completed!",
};

// Color contrast ratios (WCAG 2.1 compliant)
export const COLORS = {
  primary: "#1a73e8",
  primaryHover: "#1557b0",
  secondary: "#4caf50",
  secondaryHover: "#388e3c",
  background: "#ffffff",
  text: "#202124",
  error: "#d32f2f",
  success: "#388e3c",
  marked: "#e8f0fe",
  markedText: "#174ea6",
};
