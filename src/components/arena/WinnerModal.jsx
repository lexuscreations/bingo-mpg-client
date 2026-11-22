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
  myPlayer,
  opponentPlayer,
  matchCount = 1,
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

  const myWins = myPlayer?.wins || 0;
  const myLosses = myPlayer?.losses || 0;
  const oppWins = opponentPlayer?.wins || 0;
  const oppLosses = opponentPlayer?.losses || 0;
  const totalCompleted = myWins + myLosses;

  // Dynamic series standing narrative
  let seriesStatus = "";
  if (myWins > oppWins) {
    const diff = myWins - oppWins;
    seriesStatus = `🔥 You lead the series by ${diff} ${diff === 1 ? "win" : "wins"}!`;
  } else if (oppWins > myWins) {
    const diff = oppWins - myWins;
    seriesStatus = `⚔️ ${opponentPlayer?.name || "Opponent"} leads the series by ${diff} ${diff === 1 ? "win" : "wins"}`;
  } else {
    seriesStatus = `🤝 Series is tied at ${myWins} - ${oppWins}`;
  }

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

          {/* Head-to-Head Series Scoreboard */}
          <div className="series-scoreboard-card">
            <div className="series-card-header">
              <span className="series-header-title">SERIES SCOREBOARD</span>
              <span className="series-match-pill">
                MATCH #{matchCount} &bull; {totalCompleted} {totalCompleted === 1 ? "GAME" : "GAMES"} PLAYED
              </span>
            </div>

            <div className="series-duel-row">
              {/* You */}
              <div className={`series-player-box ${isMyWin ? "is-winner-box" : ""}`}>
                <div className="series-box-role">YOU</div>
                <div className="series-box-name">{myPlayer?.name || "You"}</div>
                <div className="series-box-score">{myWins}</div>
                <div className="series-box-sub">
                  <span className="box-win">{myWins} Won</span>
                  <span className="box-sep">•</span>
                  <span className="box-loss">{myLosses} Lost</span>
                </div>
              </div>

              {/* Divider */}
              <div className="series-duel-divider">
                <span className="duel-vs-chip">VS</span>
              </div>

              {/* Opponent */}
              <div className={`series-player-box ${!isMyWin ? "is-winner-box" : ""}`}>
                <div className="series-box-role">{opponentPlayer?.isAI ? "AI" : "OPPONENT"}</div>
                <div className="series-box-name">{opponentPlayer?.name || "Opponent"}</div>
                <div className="series-box-score">{oppWins}</div>
                <div className="series-box-sub">
                  <span className="box-win">{oppWins} Won</span>
                  <span className="box-sep">•</span>
                  <span className="box-loss">{oppLosses} Lost</span>
                </div>
              </div>
            </div>

            <div className="series-card-footer">
              <span className="series-lead-text">{seriesStatus}</span>
            </div>
          </div>

          <div className="winner-stats-box">
            <div className="stat-item">
              <span className="stat-label">Match Time</span>
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
