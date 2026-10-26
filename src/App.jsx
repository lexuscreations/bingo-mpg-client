import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import GameBoard from "./components/GameBoard";
import JoinRoom from "./components/JoinRoom";
import ThemeToggle from "./components/shared/ThemeToggle";
import Confetti from "./components/shared/Confetti";
import { copyToClipboard } from "./utils/clipboard";
import {
  playYourTurnSound,
  playLineCompleteSound,
  playVictorySound,
  toggleSound,
  isSoundEnabled,
} from "./utils/audio";

import "./App.scss";
import { BACKEND_URL } from "./utils/config";

const socket = io(BACKEND_URL || undefined);

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function App() {
  const [gameState, setGameState] = useState({
    roomId: null,
    playerName: "",
    players: [],
    currentTurn: 0,
    lastNumber: null,
    winner: null,
    winnerMessage: null,
    winnerReason: null,
  });
  const [gameStartTime, setGameStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [calledHistory, setCalledHistory] = useState([]);
  const [soundActive, setSoundActive] = useState(isSoundEnabled());
  const [pauseState, setPauseState] = useState({
    isPaused: false,
    disconnectedPlayerName: "",
    secondsLeft: 30,
  });
  const [toastMessage, setToastMessage] = useState(null);
  const prevLettersCountRef = useRef(0);

  const getCurrentPlayerIndex = () => {
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
  };

  // Timer effect (freezes when game is paused)
  useEffect(() => {
    let timerInterval;

    if (gameStartTime && !gameState.winner && !pauseState.isPaused) {
      timerInterval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameStartTime, gameState.winner, pauseState.isPaused]);

  // Auto-reconnect on mount if session exists
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("bingo_session");
      if (saved) {
        const { roomId, sessionKey, playerName } = JSON.parse(saved);
        if (roomId && sessionKey) {
          setGameState((prev) => ({
            ...prev,
            roomId,
            playerName,
          }));

          const doReconnect = () => {
            socket.emit(
              "room:reconnect",
              { roomId, sessionKey, playerName },
              ({ success, error }) => {
                if (!success) {
                  console.warn("Reconnect failed:", error);
                  sessionStorage.removeItem("bingo_session");
                  setGameState((prev) => ({
                    ...prev,
                    roomId: null,
                    playerName: "",
                  }));
                }
              },
            );
          };

          if (socket.connected) {
            doReconnect();
          } else {
            socket.once("connect", doReconnect);
          }
        }
      }
    } catch {
      sessionStorage.removeItem("bingo_session");
    }
  }, []);

  const handleCreateRoom = (playerName, customRoomId, aiOpponent) => {
    socket.emit(
      "room:create",
      { playerName, customRoomId, aiOpponent },
      ({ roomId, sessionKey, error }) => {
        if (error) {
          alert(error);
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
          alert(error);
        }
      },
    );
  };

  useEffect(() => {
    socket.on("game:start", (data) => {
      setGameState((prev) => ({
        ...prev,
        players: data.players,
        currentTurn: data.currentTurn,
        lastNumber:
          data.lastNumber !== undefined ? data.lastNumber : null,
        winner: null,
        winnerMessage: null,
        winnerReason: null,
      }));
      setGameStartTime(data.startTime || (data.players?.length === 2 ? Date.now() : null));
      setCurrentTime(
        data.startTime
          ? Math.max(0, Math.floor((Date.now() - data.startTime) / 1000))
          : 0,
      );
      if (data.calledHistory && data.calledHistory.length > 0) {
        setCalledHistory(data.calledHistory);
      } else if (data.lastNumber) {
        setCalledHistory([data.lastNumber]);
      } else {
        setCalledHistory([]);
      }
      prevLettersCountRef.current = 0;

      // If the match was paused when we reconnected, preserve the pause state!
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
      ({ players, currentTurn, lastNumber, calledHistory: srvHistory }) => {
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
    socket.on("match:resumed", ({ message }) => {
      setPauseState({
        isPaused: false,
        disconnectedPlayerName: "",
        secondsLeft: 30,
      });
      setToastMessage(message || "Opponent reconnected! Game resumed.");
      setTimeout(() => setToastMessage(null), 4500);
      playYourTurnSound();
    });

    socket.on("game:win", ({ winner, reason, message, gameTime }) => {
      setPauseState({
        isPaused: false,
        disconnectedPlayerName: "",
        secondsLeft: 30,
      });
      if (gameTime !== undefined && gameTime !== null) {
        setCurrentTime(gameTime);
      }
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
      setCurrentTime(0);
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
  }, []);

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

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundActive(next);
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
    if (
      isOngoing &&
      !window.confirm(
        "Are you sure you want to exit to lobby? (This will forfeit the match if in progress)",
      )
    ) {
      return;
    }

    if (isOngoing && gameState.roomId) {
      socket.emit("player:forfeit", { roomId: gameState.roomId });
    }
    sessionStorage.removeItem("bingo_session");
    setGameState({
      roomId: null,
      playerName: "",
      players: [],
      currentTurn: 0,
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
    setCurrentTime(0);
    window.location.reload();
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(gameState.roomId);
    if (success) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // If not in a room, render the landing Join/Create screen
  if (!gameState.roomId) {
    return (
      <JoinRoom onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
    );
  }

  const myIndex = getCurrentPlayerIndex();
  const isMyTurn = myIndex !== -1 && gameState.currentTurn === myIndex;
  const currentTurnPlayer = gameState.players[gameState.currentTurn];
  const myPlayer = (myIndex !== -1 ? gameState.players[myIndex] : null) || {
    marks: [],
    bingoLetters: [],
  };
  const opponentIndex = gameState.players.findIndex(
    (p, idx) => idx !== myIndex,
  );
  const opponentPlayer =
    opponentIndex !== -1 ? gameState.players[opponentIndex] : null;
  const isOpponentTurn =
    opponentIndex !== -1 && gameState.currentTurn === opponentIndex;

  return (
    <div className="in-game-wrapper">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="game-toast">
          <span>✨ {toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Game HUD Bar */}
      <header className="game-navbar">
        <div className="nav-left">
          <div className="game-brand">
            <span className="brand-badge">B</span>
            <span className="brand-name">BINGO</span>
          </div>

          <div
            className="room-badge"
            onClick={handleCopyCode}
            title="Click to copy room code"
          >
            <span className="room-label">ROOM</span>
            <span className="room-code">{gameState.roomId}</span>
            <button type="button" className="copy-btn">
              {copiedCode ? "✓ Copied" : "📋"}
            </button>
          </div>
        </div>

        <div className="nav-right">
          <div className="timer-badge">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">{formatTime(currentTime)}</span>
          </div>

          <button
            type="button"
            className="sound-toggle-btn"
            onClick={handleToggleSound}
            title={soundActive ? "Mute Sounds" : "Unmute Sounds"}
            aria-label={soundActive ? "Mute sounds" : "Unmute sounds"}
          >
            {soundActive ? "🔊" : "🔇"}
          </button>

          <ThemeToggle />

          <button
            type="button"
            className="leave-btn"
            onClick={handleLeaveRoom}
            title="Leave room and return to lobby"
          >
            Exit 🚪
          </button>
        </div>
      </header>

      {/* Screen 1: Waiting Room (Only 1 player connected) */}
      {gameState.players.length < 2 ? (
        <main className="waiting-container">
          <div className="waiting-card">
            <div className="radar-spinner">
              <div className="radar-circle circle-1" />
              <div className="radar-circle circle-2" />
              <div className="radar-circle circle-3" />
              <span className="radar-icon">👥</span>
            </div>

            <h2 className="waiting-title">Waiting for Opponent...</h2>
            <p className="waiting-subtitle">
              Share your room code with a friend to begin the 1v1 match!
            </p>

            <div className="invite-box">
              <span className="invite-label">ROOM CODE</span>
              <div className="invite-code-row">
                <span className="code-text">{gameState.roomId}</span>
                <button
                  type="button"
                  className="copy-invite-btn"
                  onClick={handleCopyCode}
                >
                  {copiedCode ? "✓ Copied to Clipboard" : "📋 Copy Code"}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="cancel-btn"
              onClick={handleLeaveRoom}
            >
              Cancel & Back to Lobby
            </button>
          </div>
        </main>
      ) : (
        /* Screen 2: Active Match Arena */
        <main className="arena-container">
          {/* Left Column: Interactive Bingo Board & Turn Banner */}
          <section className="board-column">
            {/* Live Turn Banner */}
            <div
              className={`turn-banner ${
                isMyTurn ? "turn-banner-mine" : "turn-banner-opponent"
              }`}
            >
              {isMyTurn ? (
                <div className="turn-content">
                  <span className="turn-pulse-dot" />
                  <strong className="turn-text">YOUR TURN</strong>
                  <span className="turn-sub">
                    Pick any unmarked number on your board!
                  </span>
                </div>
              ) : (
                <div className="turn-content">
                  <span className="turn-hourglass">⏳</span>
                  <strong className="turn-text">
                    {currentTurnPlayer?.name}&apos;s TURN
                  </strong>
                  <span className="turn-sub">
                    Waiting for opponent to make a move...
                  </span>
                </div>
              )}
            </div>

            {/* The 5x5 Bingo Board */}
            <div className="board-card">
              <GameBoard
                board={myPlayer.board || []}
                marks={myPlayer.marks || []}
                isCurrentTurn={isMyTurn}
                onCellClick={handleCellClick}
                disabled={Boolean(
                  gameState.winner || !isMyTurn || pauseState.isPaused,
                )}
                lastCalledNumber={gameState.lastNumber}
              />
            </div>
          </section>

          {/* Right Column: Battle HUD (Last Called Number & Versus Cards) */}
          <section className="hud-column">
            {/* Last Number Called Spotlight */}
            <div className="spotlight-card">
              <div className="spotlight-header">
                <span className="spotlight-label">LAST NUMBER CALLED</span>
              </div>
              <div className="bingo-ball-container">
                <div
                  className={`bingo-ball ${gameState.lastNumber ? "ball-active" : "ball-idle"}`}
                >
                  <span className="ball-gloss" />
                  <span className="ball-number">
                    {gameState.lastNumber || "—"}
                  </span>
                </div>
              </div>

              {/* Recent Call History Chips */}
              {calledHistory.length > 0 && (
                <div className="recent-calls-tray">
                  <span className="recent-calls-label">Recent:</span>
                  <div className="recent-chips-list">
                    {calledHistory.map((num, i) => (
                      <span
                        key={`${num}-${i}`}
                        className={`recent-chip ${i === 0 ? "chip-latest" : ""}`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Versus Cards (Player vs Opponent) */}
            <div className="versus-section">
              {/* Your Card */}
              <div
                className={`player-card ${
                  gameState.currentTurn === myIndex ? "player-active-turn" : ""
                }`}
              >
                <div className="player-meta">
                  <div className="player-avatar">👤</div>
                  <div className="player-name-col">
                    <strong>
                      {myPlayer.name || "You"}{" "}
                      <span className="you-tag">(You)</span>
                    </strong>
                    <span className="player-turn-state">
                      {gameState.currentTurn === myIndex
                        ? "⚡ Active Turn"
                        : "Waiting"}
                    </span>
                  </div>
                  <div className="score-count">
                    <span>{myPlayer.bingoLetters?.length || 0} / 5</span>
                  </div>
                </div>

                {/* B-I-N-G-O letters streak */}
                <div className="bingo-letters-row">
                  {["B", "I", "N", "G", "O"].map((letter) => {
                    const isUnlocked = myPlayer.bingoLetters?.includes(letter);
                    return (
                      <div
                        key={letter}
                        className={`bingo-letter-pill ${isUnlocked ? "letter-unlocked" : ""}`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VS Divider */}
              <div className="vs-badge">VS</div>

              {/* Opponent Card */}
              {opponentPlayer && (
                <div
                  className={`player-card ${
                    isOpponentTurn ? "player-active-turn" : ""
                  }`}
                >
                  <div className="player-meta">
                    <div className="player-avatar">
                      {opponentPlayer.isAI ? "🤖" : "👤"}
                    </div>
                    <div className="player-name-col">
                      <strong>
                        {opponentPlayer.name}{" "}
                        <span className="opp-tag">
                          {opponentPlayer.isAI ? "(AI)" : "(Opponent)"}
                        </span>
                      </strong>
                      <span className="player-turn-state">
                        {isOpponentTurn ? "⚡ Active Turn" : "Waiting"}
                      </span>
                    </div>
                    <div className="score-count">
                      <span>
                        {opponentPlayer.bingoLetters?.length || 0} / 5
                      </span>
                    </div>
                  </div>

                  {/* B-I-N-G-O letters streak */}
                  <div className="bingo-letters-row">
                    {["B", "I", "N", "G", "O"].map((letter) => {
                      const isUnlocked =
                        opponentPlayer.bingoLetters?.includes(letter);
                      return (
                        <div
                          key={letter}
                          className={`bingo-letter-pill ${isUnlocked ? "letter-unlocked" : ""}`}
                        >
                          {letter}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Match Paused Modal (30s Reconnect Countdown & Substitute Invitation) */}
          {pauseState.isPaused && (
            <div className="pause-modal-overlay">
              <div className="pause-card">
                <div className="pause-timer-ring">
                  <span className="pause-hourglass">⏳</span>
                  <span className="pause-seconds">
                    {pauseState.secondsLeft}s
                  </span>
                </div>
                <h2 className="pause-title">Match Paused</h2>
                <p className="pause-subtitle">
                  <strong>{pauseState.disconnectedPlayerName}</strong>{" "}
                  disconnected. Waiting for them to reconnect...
                </p>

                <div className="pause-progress-bar">
                  <div
                    className="pause-progress-fill"
                    style={{ width: `${(pauseState.secondsLeft / 30) * 100}%` }}
                  />
                </div>

                <div className="pause-substitute-box">
                  <span className="sub-label">WAIT OR INVITE A FRIEND</span>
                  <p className="sub-hint">
                    You can wait for auto-forfeit, or share this room code with
                    another friend to take over as substitute!
                  </p>
                  <div className="sub-code-row">
                    <span className="sub-code">{gameState.roomId}</span>
                    <button
                      type="button"
                      className="copy-invite-btn"
                      onClick={handleCopyCode}
                    >
                      {copiedCode ? "✓ Copied" : "📋 Copy Code"}
                    </button>
                  </div>
                </div>

                <div className="pause-actions">
                  <button
                    type="button"
                    className="claim-win-btn"
                    onClick={handleClaimForfeit}
                  >
                    Claim Win by Forfeit 🏆
                  </button>
                  <button
                    type="button"
                    className="exit-btn"
                    onClick={handleLeaveRoom}
                  >
                    Exit to Lobby 🚪
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Winner Celebration Modal & Confetti */}
          {gameState.winner && (
            <>
              {gameState.winner === (myPlayer.name || gameState.playerName) && (
                <Confetti />
              )}
              <div className="modal-overlay">
                <div className="winner-card">
                  <div className="trophy-badge">
                    {gameState.winner === (myPlayer.name || gameState.playerName)
                      ? "🏆"
                      : "🚪"}
                  </div>
                  <h2
                    className={`winner-heading ${
                      gameState.winner !== (myPlayer.name || gameState.playerName)
                        ? "is-loss"
                        : ""
                    }`}
                  >
                    {gameState.winnerReason === "forfeit" ||
                    gameState.winnerReason === "timeout"
                      ? gameState.winner ===
                        (myPlayer.name || gameState.playerName)
                        ? "VICTORY BY FORFEIT!"
                        : "MATCH FORFEITED"
                      : gameState.winner ===
                        (myPlayer.name || gameState.playerName)
                      ? "VICTORY!"
                      : "DEFEAT"}
                  </h2>
                  <p className="winner-sub">
                    {gameState.winnerMessage || (
                      <>
                        <strong className="winner-name">
                          {gameState.winner}
                        </strong>{" "}
                        has completed B-I-N-G-O!
                      </>
                    )}
                  </p>

                  <div className="winner-stats-box">
                    <div className="stat-item">
                      <span className="stat-label">Total Time</span>
                      <strong className="stat-value">
                        {formatTime(currentTime)}
                      </strong>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Marks</span>
                      <strong className="stat-value">
                        {myPlayer.marks?.length || 0}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="play-again-btn"
                      onClick={handleReset}
                    >
                      Play Again 🔄
                    </button>
                    <button
                      type="button"
                      className="exit-btn"
                      onClick={handleLeaveRoom}
                    >
                      Exit to Lobby 🏠
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
