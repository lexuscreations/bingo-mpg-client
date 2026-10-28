import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../services/socket";
import {
  playYourTurnSound,
  playLineCompleteSound,
  playVictorySound,
} from "../utils/audio";
import { formatTurnToast } from "../utils/turnRules";


export function useSocketGame(showToast, clearToast, setNoticeModal) {
  const [gameState, setGameState] = useState({
    roomId: null,
    playerName: "",
    players: [],
    currentTurn: 0,
    firstTurnRule: "alternating",
    turnReason: null,
    starterPlayerName: null,
    lastNumber: null,
    winner: null,
    winnerMessage: null,
    winnerReason: null,
  });

  const [gameStartTime, setGameStartTime] = useState(null);
  const [calledHistory, setCalledHistory] = useState([]);
  const [pauseState, setPauseState] = useState({
    isPaused: false,
    disconnectedPlayerName: "",
    secondsLeft: 30,
  });

  const prevLettersCountRef = useRef(0);

  const getCurrentPlayerIndex = useCallback(() => {
    // 1. Direct server flag 'isYou'
    const youIdx = gameState.players.findIndex((p) => p.isYou);
    if (youIdx !== -1) return youIdx;

    // 2. Persistent session key
    try {
      const saved = sessionStorage.getItem("bingo_session");
      if (saved) {
        const { sessionKey, playerName } = JSON.parse(saved);
        if (sessionKey) {
          const sIdx = gameState.players.findIndex(
            (p) => p.sessionKey === sessionKey,
          );
          if (sIdx !== -1) return sIdx;
        }
        if (playerName) {
          const nIdx = gameState.players.findIndex(
            (p) => p.name === playerName,
          );
          if (nIdx !== -1) return nIdx;
        }
      }
    } catch {}

    // 3. Live Socket ID check
    const sockIdx = gameState.players.findIndex(
      (p) => p.id && p.id === socket.id,
    );
    if (sockIdx !== -1) return sockIdx;

    // 4. Fallback to state playerName
    if (gameState.playerName) {
      const pIdx = gameState.players.findIndex(
        (p) => p.name === gameState.playerName,
      );
      if (pIdx !== -1) return pIdx;
    }

    return -1;
  }, [gameState.players, gameState.playerName]);

  // Synchronize session with server on reconnect, tab focus, or screen unlock
  const syncCurrentSession = useCallback(() => {
    try {
      const saved = sessionStorage.getItem("bingo_session");
      if (!saved) return;
      const { roomId, sessionKey, playerName } = JSON.parse(saved);
      if (!roomId || !sessionKey) return;

      setGameState((prev) => ({
        ...prev,
        roomId,
        playerName: playerName || prev.playerName,
      }));

      if (!socket.connected) {
        socket.connect();
        return;
      }

      socket.emit(
        "room:reconnect",
        { roomId, sessionKey, playerName },
        ({ success, room, error }) => {
          if (success && room) {
            setGameState((prev) => ({
              ...prev,
              roomId: room.id || room.roomId || roomId,
              players: room.players,
              currentTurn: room.currentTurn,
              firstTurnRule:
                room.firstTurnRule || prev.firstTurnRule || "alternating",
              turnReason: room.turnReason || prev.turnReason || null,
              starterPlayerName:
                room.starterPlayerName || prev.starterPlayerName || null,
              lastNumber: room.lastNumber,
              winner: room.winner,
              winnerMessage: room.winnerMessage,
              winnerReason: room.winnerReason,
            }));
            if (room.startTime) {
              setGameStartTime(room.startTime);
            }
            if (room.calledHistory) {
              setCalledHistory(room.calledHistory);
            }
          } else if (error) {
            sessionStorage.removeItem("bingo_session");
            setGameState((prev) => ({ ...prev, roomId: null, players: [] }));
            if (setNoticeModal) {
              setNoticeModal({
                title: "Session Expired",
                message:
                  "Your room session has expired. Please create or join a new room.",
                icon: "⌛",
              });
            }
          }
        },
      );
    } catch {}
  }, [setNoticeModal]);

  // Re-sync session as soon as socket connects
  useEffect(() => {
    const handleConnect = () => {
      syncCurrentSession();
    };

    socket.on("connect", handleConnect);
    return () => {
      socket.off("connect", handleConnect);
    };
  }, [syncCurrentSession]);

  // Backgrounding, Tab switching, & Mobile screen lock/wake detection
  useEffect(() => {
    syncCurrentSession();

    const handleVisibilityChange = () => {
      const currentRoomId = gameState.roomId;
      if (document.hidden) {
        if (currentRoomId) {
          socket.emit("player:backgrounded", { roomId: currentRoomId });
        }
      } else {
        if (currentRoomId) {
          socket.emit("player:foregrounded", { roomId: currentRoomId });
        }
        syncCurrentSession();
      }
    };

    const handleFocus = () => {
      syncCurrentSession();
    };

    const handlePageShow = () => {
      syncCurrentSession();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [syncCurrentSession, gameState.roomId]);

  // Main Socket Event Listeners
  useEffect(() => {
    socket.on("game:start", (data) => {
      setGameState((prev) => ({
        ...prev,
        players: data.players,
        currentTurn: data.currentTurn,
        lastNumber:
          data.lastNumber !== undefined ? data.lastNumber : null,
        firstTurnRule: data.firstTurnRule || prev.firstTurnRule || "alternating",
        turnReason: data.turnReason || prev.turnReason || null,
        starterPlayerName: data.starterPlayerName || prev.starterPlayerName || null,
        winner: null,
        winnerMessage: null,
        winnerReason: null,
      }));
      setGameStartTime(
        data.startTime || (data.players?.length === 2 ? Date.now() : null),
      );
      if (data.calledHistory && data.calledHistory.length > 0) {
        setCalledHistory(data.calledHistory);
      } else if (data.lastNumber) {
        setCalledHistory([data.lastNumber]);
      } else {
        setCalledHistory([]);
      }
      prevLettersCountRef.current = 0;

      // Toast notification for match starter announcement (coin toss / alternating / winner / host)
      // Only announce when it is a genuine fresh match start (not a reconnect sync, and no called history)
      const isFreshMatch =
        !data.isReconnect &&
        (!data.calledHistory || data.calledHistory.length === 0) &&
        (data.lastNumber === null || data.lastNumber === undefined);

      if (isFreshMatch && data.turnReason && data.players?.length === 2 && showToast) {
        showToast(
          formatTurnToast(data.turnReason, data.starterPlayerName),
          4500,
        );
      }

      // If the match was paused when we reconnected, preserve the pause state
      if (data.isPaused) {
        setPauseState({
          isPaused: true,
          disconnectedPlayerName: data.disconnectedPlayerName || "Opponent",
          secondsLeft: data.timeoutSeconds || 30,
        });
      } else {
        setPauseState({
          isPaused: false,
          disconnectedPlayerName: "",
          secondsLeft: 30,
        });
      }
    });

    socket.on(
      "game:update",
      ({
        players,
        currentTurn,
        lastNumber,
        calledHistory: srvHistory,
        firstTurnRule,
        turnReason,
        starterPlayerName,
      }) => {
        setGameState((prev) => {
          const myIdx = players.findIndex(
            (p) => p.isYou || p.id === socket.id,
          );
          const myUpdatedPlayer = myIdx !== -1 ? players[myIdx] : null;
          if (
            myUpdatedPlayer?.bingoLetters?.length >
            prevLettersCountRef.current
          ) {
            playLineCompleteSound();
            prevLettersCountRef.current =
              myUpdatedPlayer.bingoLetters.length;
          }

          if (
            myIdx !== -1 &&
            currentTurn === myIdx &&
            prev.currentTurn !== myIdx
          ) {
            playYourTurnSound();
          }

          return {
            ...prev,
            players,
            currentTurn,
            lastNumber,
            firstTurnRule: firstTurnRule || prev.firstTurnRule,
            turnReason: turnReason !== undefined ? turnReason : prev.turnReason,
            starterPlayerName:
              starterPlayerName !== undefined
                ? starterPlayerName
                : prev.starterPlayerName,
          };
        });

        if (srvHistory && srvHistory.length > 0) {
          setCalledHistory(srvHistory);
        } else if (lastNumber !== null && lastNumber !== undefined) {
          setCalledHistory((prev) => {
            return [
              lastNumber,
              ...prev.filter((n) => n !== lastNumber),
            ].slice(0, 5);
          });
        }
      },
    );

    // Match Paused (opponent unexpectedly dropped connection)
    socket.on("match:paused", ({ disconnectedPlayerName, timeoutSeconds }) => {
      setPauseState({
        isPaused: true,
        disconnectedPlayerName: disconnectedPlayerName || "Opponent",
        secondsLeft: timeoutSeconds || 30,
      });
    });

    // Live countdown tick for pause modal
    socket.on("match:pause_tick", ({ secondsLeft }) => {
      setPauseState((prev) => ({
        ...prev,
        secondsLeft,
      }));
    });

    // Match Resumed (opponent or substitute reconnected)
    socket.on("match:resumed", () => {
      setPauseState({
        isPaused: false,
        disconnectedPlayerName: "",
        secondsLeft: 30,
      });
    });

    socket.on("game:win", ({ winner, message, reason }) => {
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          winner,
          winnerMessage: message || `${winner} has completed B-I-N-G-O!`,
          winnerReason: reason || "bingo",
        }));
        playVictorySound();
      }, 100);
    });

    socket.on("player:disconnect", () => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.slice(0, 1).map((p) => ({
          ...p,
          marks: [],
          bingoLetters: [],
        })),
        winner: null,
        winnerMessage: null,
        winnerReason: null,
        lastNumber: null,
      }));
      setCalledHistory([]);
      setGameStartTime(null);
    });

    return () => {
      socket.off("game:start");
      socket.off("game:update");
      socket.off("match:paused");
      socket.off("match:pause_tick");
      socket.off("match:resumed");
      socket.off("game:win");
      socket.off("player:disconnect");
    };
  }, [showToast]);

  const handleCreateRoom = (
    playerName,
    customRoomId,
    aiOpponent,
    firstTurnRule,
  ) => {
    socket.emit(
      "room:create",
      { playerName, customRoomId, aiOpponent, firstTurnRule },
      ({ roomId, sessionKey, error }) => {
        if (error) {
          if (setNoticeModal) {
            setNoticeModal({
              title: "Cannot Create Room",
              message: error,
              icon: "⚠️",
            });
          }
        } else {
          if (sessionKey) {
            sessionStorage.setItem(
              "bingo_session",
              JSON.stringify({ roomId, sessionKey, playerName }),
            );
          }
          setGameState((prev) => ({
            ...prev,
            roomId,
            playerName,
            firstTurnRule: firstTurnRule || "alternating",
          }));
        }
      },
    );
  };

  const handleJoinRoom = (roomId, playerName) => {
    socket.emit(
      "room:join",
      { roomId, playerName },
      ({ error, success, sessionKey }) => {
        if (success) {
          if (sessionKey) {
            sessionStorage.setItem(
              "bingo_session",
              JSON.stringify({ roomId, sessionKey, playerName }),
            );
          }
          setGameState((prev) => ({
            ...prev,
            roomId,
            playerName,
          }));
        } else if (error) {
          if (setNoticeModal) {
            const isNotFound = error.toLowerCase().includes("not found");
            const isFull = error.toLowerCase().includes("full");
            setNoticeModal({
              title: isNotFound
                ? "Room Not Found"
                : isFull
                  ? "Room Is Full"
                  : "Unable to Join Room",
              message: isNotFound
                ? `Room "${roomId}" could not be found. Please double-check the room code or ask the host if the room is still open.`
                : error,
              icon: isNotFound ? "🔍" : isFull ? "🚪" : "⚠️",
            });
          }
        }
      },
    );
  };

  const handleCellClick = (number) => {
    if (!gameState.winner && !pauseState.isPaused) {
      socket.emit("turn:click", {
        roomId: gameState.roomId,
        number,
      });
    }
  };

  const handleReset = () => {
    socket.emit("game:reset", { roomId: gameState.roomId });
  };

  const handleClaimForfeit = () => {
    socket.emit("player:claim_forfeit", { roomId: gameState.roomId });
    setPauseState({
      isPaused: false,
      disconnectedPlayerName: "",
      secondsLeft: 30,
    });
  };

  const handleLeaveRoom = () => {
    const isOngoing = !gameState.winner && gameState.players.length === 2;
    if (isOngoing && gameState.roomId) {
      socket.emit("player:forfeit", { roomId: gameState.roomId });
    }
    if (gameState.roomId) {
      socket.emit("room:leave", { roomId: gameState.roomId });
    }
    sessionStorage.removeItem("bingo_session");
    setGameState({
      roomId: null,
      playerName: "",
      players: [],
      currentTurn: 0,
      firstTurnRule: "alternating",
      turnReason: null,
      starterPlayerName: null,
      lastNumber: null,
      winner: null,
      winnerMessage: null,
      winnerReason: null,
    });
    setPauseState({
      isPaused: false,
      disconnectedPlayerName: "",
      secondsLeft: 30,
    });
    setGameStartTime(null);
    setCalledHistory([]);
    if (clearToast) clearToast();
  };

  return {
    gameState,
    gameStartTime,
    calledHistory,
    pauseState,
    getCurrentPlayerIndex,
    handleCreateRoom,
    handleJoinRoom,
    handleCellClick,
    handleReset,
    handleClaimForfeit,
    handleLeaveRoom,
  };
}
