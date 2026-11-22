import React from "react";

function TurnBanner({ isMyTurn, currentTurnPlayer }) {
  return (
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
  );
}

export default TurnBanner;
