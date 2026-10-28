import React from "react";

function SpotlightTray({ lastNumber, calledHistory = [] }) {
  return (
    <div className="spotlight-card">
      <div className="spotlight-header">
        <span className="spotlight-label">LAST NUMBER CALLED</span>
      </div>
      <div className="bingo-ball-container">
        <div className={`bingo-ball ${lastNumber ? "ball-active" : "ball-idle"}`}>
          <span className="ball-gloss" />
          <span className="ball-number">{lastNumber || "—"}</span>
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
  );
}

export default SpotlightTray;
