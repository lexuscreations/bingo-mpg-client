import React, { useState } from "react";

import GameBoard from "./components/GameBoard";
import JoinRoom from "./components/JoinRoom";
import Navbar from "./components/arena/Navbar";
import TurnBanner from "./components/arena/TurnBanner";
import SpotlightTray from "./components/arena/SpotlightTray";
import VersusSection from "./components/arena/VersusSection";
import PauseModal from "./components/arena/PauseModal";
import WinnerModal from "./components/arena/WinnerModal";
import ExitConfirmModal from "./components/arena/ExitConfirmModal";
import WaitingRoom from "./components/lobby/WaitingRoom";
import Toast from "./components/shared/Toast";
import NoticeModal from "./components/shared/NoticeModal";

import { useSocketGame } from "./hooks/useSocketGame";
import { useGameTimer } from "./hooks/useGameTimer";
import { useToast } from "./hooks/useToast";
import { copyToClipboard } from "./utils/clipboard";
import { isSoundEnabled, toggleSound } from "./utils/audio";
import { getPlayerStatus } from "./utils/playerStatus";

import "./App.scss";

function App() {
  const [soundActive, setSoundActive] = useState(isSoundEnabled());
  const [copiedCode, setCopiedCode] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [noticeModal, setNoticeModal] = useState(null);

  const { toastMessage, showToast, clearToast } = useToast();

  const {
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
  } = useSocketGame(showToast, clearToast, setNoticeModal);

  const { currentTime } = useGameTimer(
    gameStartTime,
    Boolean(gameState.winner),
    pauseState.isPaused,
  );

  const handleCopyCode = async () => {
    const success = await copyToClipboard(gameState.roomId);
    if (success) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundActive(next);
  };

  const handleRequestExit = () => {
    const isOngoing = !gameState.winner && gameState.players.length === 2;
    if (isOngoing) {
      setShowExitConfirm(true);
    } else {
      handleLeaveRoom();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    handleLeaveRoom();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  // If not in a room, render the landing Join/Create screen
  if (!gameState.roomId) {
    return (
      <>
        <JoinRoom onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        <NoticeModal
          notice={noticeModal}
          onClose={() => setNoticeModal(null)}
        />
      </>
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

  const myStatus = getPlayerStatus(myPlayer);
  const oppStatus = getPlayerStatus(opponentPlayer);

  return (
    <div className="in-game-wrapper">
      {/* Toast Notification Banner */}
      <Toast message={toastMessage} />

      {/* Top Navigation & Game HUD Bar */}
      <Navbar
        roomId={gameState.roomId}
        firstTurnRule={gameState.firstTurnRule}
        turnReason={gameState.turnReason}
        starterPlayerName={gameState.starterPlayerName}
        currentTime={currentTime}
        soundActive={soundActive}
        onToggleSound={handleToggleSound}
        onLeaveRoom={handleRequestExit}
        onCopyCode={handleCopyCode}
        copiedCode={copiedCode}
      />

      {/* Screen 1: Waiting Room (Only 1 player connected) */}
      {gameState.players.length < 2 ? (
        <WaitingRoom
          roomId={gameState.roomId}
          copiedCode={copiedCode}
          onCopyCode={handleCopyCode}
          onCancel={handleLeaveRoom}
        />
      ) : (
        /* Screen 2: Active Match Arena */
        <main className="arena-container">
          {/* Left Column: Interactive Bingo Board & Turn Banner */}
          <section className="board-column">
            <TurnBanner
              isMyTurn={isMyTurn}
              currentTurnPlayer={currentTurnPlayer}
            />

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
            <SpotlightTray
              lastNumber={gameState.lastNumber}
              calledHistory={calledHistory}
            />

            <VersusSection
              myPlayer={myPlayer}
              opponentPlayer={opponentPlayer}
              myStatus={myStatus}
              oppStatus={oppStatus}
              isMyTurn={isMyTurn}
              isOpponentTurn={isOpponentTurn}
            />
          </section>

          {/* Match Paused Modal (30s Reconnect Countdown & Substitute Invitation) */}
          <PauseModal
            pauseState={pauseState}
            roomId={gameState.roomId}
            copiedCode={copiedCode}
            onCopyCode={handleCopyCode}
            onClaimForfeit={handleClaimForfeit}
            onLeaveRoom={handleLeaveRoom}
          />

          {/* Winner Celebration Modal & Confetti */}
          <WinnerModal
            winner={gameState.winner}
            winnerMessage={gameState.winnerMessage}
            winnerReason={gameState.winnerReason}
            isMyWin={
              gameState.winner === (myPlayer.name || gameState.playerName)
            }
            currentTime={currentTime}
            myMarksCount={myPlayer.marks?.length || 0}
            onPlayAgain={handleReset}
            onLeaveRoom={handleLeaveRoom}
          />
        </main>
      )}

      {/* Sleek Mid-Game Forfeit & Exit Confirmation Modal */}
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      {/* Sleek Alert / Error Notice Modal */}
      <NoticeModal
        notice={noticeModal}
        onClose={() => setNoticeModal(null)}
      />
    </div>
  );
}

export default App;
