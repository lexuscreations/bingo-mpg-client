import { useState, useEffect } from "react";

export function useGameTimer(gameStartTime, isWinner, isPaused) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let timerInterval;

    if (gameStartTime && !isWinner && !isPaused) {
      timerInterval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameStartTime, isWinner, isPaused]);

  return { currentTime, setCurrentTime };
}
