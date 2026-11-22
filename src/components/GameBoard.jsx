import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./GameBoard.module.scss";
import { KEYS, ARIA_LABELS } from "../utils/accessibility";
import { playTileClick } from "../utils/audio";

const getActiveLineTypes = (index, completedLines) => {
  const row = Math.floor(index / 5);
  const col = index % 5;
  const types = [];

  // Horizontal line check
  const rowPositions = [
    row * 5,
    row * 5 + 1,
    row * 5 + 2,
    row * 5 + 3,
    row * 5 + 4,
  ];
  if (
    completedLines.some(
      (line) => JSON.stringify(line) === JSON.stringify(rowPositions),
    )
  ) {
    types.push("horizontal");
  }

  // Vertical line check
  const colPositions = [col, col + 5, col + 10, col + 15, col + 20];
  if (
    completedLines.some(
      (line) => JSON.stringify(line) === JSON.stringify(colPositions),
    )
  ) {
    types.push("vertical");
  }

  // Main diagonal check
  const diag1Positions = [0, 6, 12, 18, 24];
  if (
    diag1Positions.includes(index) &&
    completedLines.some(
      (line) => JSON.stringify(line) === JSON.stringify(diag1Positions),
    )
  ) {
    types.push("diagonalRight");
  }

  // Anti diagonal check
  const diag2Positions = [4, 8, 12, 16, 20];
  if (
    diag2Positions.includes(index) &&
    completedLines.some(
      (line) => JSON.stringify(line) === JSON.stringify(diag2Positions),
    )
  ) {
    types.push("diagonalLeft");
  }

  return types;
};

const Cell = memo(
  ({
    number,
    isMarked,
    lineTypes = [],
    onClick,
    disabled,
    isProcessing,
    isLastCalled,
  }) => {
    const handleKeyPress = (e) => {
      if (disabled) return;
      if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={`${styles.cell} ${isMarked ? styles.marked : ""} ${
          isProcessing ? styles.processing : ""
        } ${isLastCalled ? styles.lastCalled : ""}`}
        onClick={disabled || isMarked ? undefined : onClick}
        onKeyDown={handleKeyPress}
        aria-label={ARIA_LABELS.cell(number)}
        aria-pressed={isMarked}
        aria-disabled={disabled}
      >
        <span className={styles.cellNumber}>{number}</span>

        {isMarked && (
          <span className={styles.checkBadge} aria-hidden="true">
            ✓
          </span>
        )}

        {isProcessing && (
          <div
            className={styles.processingIndicator}
            role="presentation"
            aria-hidden="true"
          >
            ⏳
          </div>
        )}

        {isMarked &&
          lineTypes.map((type) => (
            <div
              key={type}
              className={`${styles.strikeLine} ${styles[type]}`}
              role="presentation"
              aria-hidden="true"
            />
          ))}
      </div>
    );
  },
);

const GameBoard = ({
  board,
  marks = [],
  completedLines: externalCompletedLines,
  onCellClick,
  disabled = false,
  isCurrentTurn = false,
  lastCalledNumber = null,
}) => {
  const boardRef = useRef(null);
  const [processingCell, setProcessingCell] = useState(null);

  // Automatically compute completed lines on the board if not explicitly provided
  const completedLines = useMemo(() => {
    if (externalCompletedLines && externalCompletedLines.length > 0) {
      return externalCompletedLines;
    }
    if (!board || board.length !== 25 || !marks) return [];

    const lines = [];

    // 5 Rows
    for (let r = 0; r < 5; r++) {
      const row = [r * 5, r * 5 + 1, r * 5 + 2, r * 5 + 3, r * 5 + 4];
      if (row.every((pos) => marks.includes(board[pos]))) {
        lines.push(row);
      }
    }

    // 5 Columns
    for (let c = 0; c < 5; c++) {
      const col = [c, c + 5, c + 10, c + 15, c + 20];
      if (col.every((pos) => marks.includes(board[pos]))) {
        lines.push(col);
      }
    }

    // Main diagonal
    const diag1 = [0, 6, 12, 18, 24];
    if (diag1.every((pos) => marks.includes(board[pos]))) {
      lines.push(diag1);
    }

    // Anti diagonal
    const diag2 = [4, 8, 12, 16, 20];
    if (diag2.every((pos) => marks.includes(board[pos]))) {
      lines.push(diag2);
    }

    return lines;
  }, [externalCompletedLines, board, marks]);

  const handleClick = useCallback(
    (number) => {
      if (!disabled && !marks.includes(number)) {
        playTileClick();
        setProcessingCell(number);
        onCellClick(number);
        setTimeout(() => {
          setProcessingCell(null);
        }, 500);
      }
    },
    [disabled, marks, onCellClick],
  );

  // Keyboard navigation
  const handleKeyNavigation = useCallback((e) => {
    if (!boardRef.current) return;

    const cells = boardRef.current.querySelectorAll('[role="button"]');
    const currentIndex = Array.from(cells).indexOf(document.activeElement);
    if (currentIndex === -1) return;

    switch (e.key) {
      case KEYS.ARROW_RIGHT:
        if (currentIndex < cells.length - 1) cells[currentIndex + 1].focus();
        break;
      case KEYS.ARROW_LEFT:
        if (currentIndex > 0) cells[currentIndex - 1].focus();
        break;
      case KEYS.ARROW_UP:
        if (currentIndex >= 5) cells[currentIndex - 5].focus();
        break;
      case KEYS.ARROW_DOWN:
        if (currentIndex < cells.length - 5) cells[currentIndex + 5].focus();
        break;
      default:
        return;
    }
    e.preventDefault();
  }, []);

  useEffect(() => {
    const currentBoard = boardRef.current;
    if (currentBoard) {
      currentBoard.addEventListener("keydown", handleKeyNavigation);
      return () =>
        currentBoard.removeEventListener("keydown", handleKeyNavigation);
    }
  }, [handleKeyNavigation]);

  return (
    <div
      ref={boardRef}
      className={`${styles.board} ${isCurrentTurn ? styles.boardActiveTurn : styles.boardWaiting}`}
      role="grid"
      aria-label={ARIA_LABELS.board}
      aria-live="polite"
    >
      {board.map((number, index) => {
        const isMarked = marks.includes(number);
        const lineTypes = isMarked
          ? getActiveLineTypes(index, completedLines)
          : [];
        const isLastCalled = lastCalledNumber === number;

        return (
          <Cell
            key={`${index}-${number}`}
            number={number}
            isMarked={isMarked}
            lineTypes={lineTypes}
            onClick={() => handleClick(number)}
            disabled={disabled || isMarked}
            isProcessing={processingCell === number}
            isLastCalled={isLastCalled}
          />
        );
      })}
    </div>
  );
};

export default memo(GameBoard);
