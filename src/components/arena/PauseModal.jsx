import React from "react";

function PauseModal({
  pauseState,
  roomId,
  copiedCode,
  onCopyCode,
  onClaimForfeit,
  onLeaveRoom,
}) {
  if (!pauseState?.isPaused) return null;

  return (
    <div className="pause-modal-overlay">
      <div className="pause-card">
        <div className="pause-timer-ring">
          <span className="pause-hourglass">⏳</span>
          <span className="pause-seconds">{pauseState.secondsLeft}s</span>
        </div>
        <h2 className="pause-title">Match Paused</h2>
        <p className="pause-subtitle">
          <strong>{pauseState.disconnectedPlayerName}</strong> disconnected.
          Waiting for them to reconnect...
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
            You can wait for auto-forfeit, or share this room code with another
            friend to take over as substitute!
          </p>
          <div className="sub-code-row">
            <span className="sub-code">{roomId}</span>
            <button
              type="button"
              className="copy-invite-btn"
              onClick={onCopyCode}
            >
              {copiedCode ? "✓ Copied" : "📋 Copy Code"}
            </button>
          </div>
        </div>

        <div className="pause-actions">
          <button
            type="button"
            className="claim-win-btn"
            onClick={onClaimForfeit}
          >
            Claim Win by Forfeit 🏆
          </button>
          <button type="button" className="exit-btn" onClick={onLeaveRoom}>
            Exit to Lobby 🚪
          </button>
        </div>
      </div>
    </div>
  );
}

export default PauseModal;
