import React from "react";
import Confetti from "../shared/Confetti";
import { formatTime } from "../../utils/playerStatus";

function WinnerModal({
  winner,
  winnerMessage,
  winnerReason,
  isMyWin,
  currentTime,
  myMarksCount = 0,
  onPlayAgain,
  onLeaveRoom,
}) {
  if (!winner) return null;

  const isForfeit = winnerReason === "forfeit" || winnerReason === "timeout";
  const headingText = isForfeit
    ? isMyWin
      ? "VICTORY BY FORFEIT!"
      : "MATCH FORFEITED"
    : isMyWin
      ? "VICTORY!"
      : "DEFEAT";

  return (
    <>
      {isMyWin && <Confetti />}
      <div className="modal-overlay">
        <div className="winner-card">
          <div className="trophy-badge">{isMyWin ? "🏆" : "🚪"}</div>
          <h2 className={`winner-heading ${!isMyWin ? "is-loss" : ""}`}>
            {headingText}
          </h2>
          <p className="winner-sub">
            {winnerMessage || (
              <>
                <strong className="winner-name">{winner}</strong> has completed
                B-I-N-G-O!
              </>
            )}
          </p>

          <div className="winner-stats-box">
            <div className="stat-item">
              <span className="stat-label">Total Time</span>
              <strong className="stat-value">{formatTime(currentTime)}</strong>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Marks</span>
              <strong className="stat-value">{myMarksCount}</strong>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="play-again-btn"
              onClick={onPlayAgain}
            >
              Play Again 🔄
            </button>
            <button type="button" className="exit-btn" onClick={onLeaveRoom}>
              Exit to Lobby 🏠
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WinnerModal;
