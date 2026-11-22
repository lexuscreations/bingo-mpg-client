import React from "react";

function PauseModal({
  pauseState,
  roomId,
  copiedCode,
  myPlayer,
  opponentPlayer,
  matchCount = 1,
  onCopyCode,
  onClaimForfeit,
  onLeaveRoom,
}) {
  if (!pauseState?.isPaused) return null;

  const myWins = myPlayer?.wins || 0;
  const myLosses = myPlayer?.losses || 0;
  const oppWins = opponentPlayer?.wins || 0;
  const oppLosses = opponentPlayer?.losses || 0;
  const totalCompleted = myWins + myLosses;

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

        {/* Series Standings Card */}
        <div className="pause-series-card">
          <div className="pause-series-header">
            <div className="pause-series-title-row">
              <span className="pause-series-icon">📊</span>
              <span className="pause-series-title">Series Standings</span>
            </div>
            <span className="pause-series-badge">
              Match #{matchCount} &bull; {totalCompleted} {totalCompleted === 1 ? "Game" : "Games"} Completed
            </span>
          </div>

          <div className="pause-series-grid">
            {/* You */}
            <div className="pause-player-col">
              <span className="pause-role-tag">YOU</span>
              <span className="pause-player-name">{myPlayer?.name || "You"}</span>
              <div className="pause-score-pill">
                <span className="pill-w">{myWins} Won</span>
                <span className="pill-divider">•</span>
                <span className="pill-l">{myLosses} Lost</span>
              </div>
            </div>

            {/* Score Center */}
            <div className="pause-score-center">
              <div className="pause-score-nums">
                <span className={myWins > oppWins ? "is-lead" : ""}>{myWins}</span>
                <span className="pause-score-colon">:</span>
                <span className={oppWins > myWins ? "is-lead" : ""}>{oppWins}</span>
              </div>
              <span className="pause-score-sub">Series Score</span>
            </div>

            {/* Opponent */}
            <div className="pause-player-col">
              <span className="pause-role-tag">{opponentPlayer?.isAI ? "AI" : "OPPONENT"}</span>
              <span className="pause-player-name">{opponentPlayer?.name || "Opponent"}</span>
              <div className="pause-score-pill">
                <span className="pill-w">{oppWins} Won</span>
                <span className="pill-divider">•</span>
                <span className="pill-l">{oppLosses} Lost</span>
              </div>
            </div>
          </div>
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
