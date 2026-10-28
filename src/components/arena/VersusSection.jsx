import React from "react";

const BINGO_LETTERS = ["B", "I", "N", "G", "O"];

function VersusSection({
  myPlayer,
  opponentPlayer,
  myStatus,
  oppStatus,
  isMyTurn,
  isOpponentTurn,
}) {
  return (
    <div className="versus-section">
      {/* Your Card */}
      <div className={`player-card ${isMyTurn ? "player-active-turn" : ""}`}>
        <div className="player-meta">
          <div className="player-avatar" title={`Status: ${myStatus.label}`}>
            👤
            <span className={`status-badge ${myStatus.dotClass}`} />
          </div>
          <div className="player-name-col">
            <div className="player-name-row">
              <span className="player-display-name" title={myPlayer.name || "You"}>
                {myPlayer.name || "You"}
              </span>
              <span className="you-tag">(You)</span>
            </div>
            <span className="player-turn-state">
              {myStatus.status === "away"
                ? "🟡 Away (In Background)"
                : myStatus.status === "offline"
                  ? "🔴 Disconnected"
                  : isMyTurn
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
          {BINGO_LETTERS.map((letter) => {
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
        <div className={`player-card ${isOpponentTurn ? "player-active-turn" : ""}`}>
          <div className="player-meta">
            <div className="player-avatar" title={`Status: ${oppStatus?.label}`}>
              {opponentPlayer.isAI ? "🤖" : "👤"}
              <span className={`status-badge ${oppStatus?.dotClass}`} />
            </div>
            <div className="player-name-col">
              <div className="player-name-row">
                <span className="player-display-name" title={opponentPlayer.name}>
                  {opponentPlayer.name}
                </span>
                <span className="opp-tag">
                  {opponentPlayer.isAI ? "(AI)" : "(Opponent)"}
                </span>
              </div>
              <span className="player-turn-state">
                {oppStatus?.status === "away"
                  ? "🟡 Away (In Background)"
                  : oppStatus?.status === "offline"
                    ? "🔴 Disconnected"
                    : isOpponentTurn
                      ? "⚡ Active Turn"
                      : "Waiting"}
              </span>
            </div>
            <div className="score-count">
              <span>{opponentPlayer.bingoLetters?.length || 0} / 5</span>
            </div>
          </div>

          {/* B-I-N-G-O letters streak */}
          <div className="bingo-letters-row">
            {BINGO_LETTERS.map((letter) => {
              const isUnlocked = opponentPlayer.bingoLetters?.includes(letter);
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
  );
}

export default VersusSection;
