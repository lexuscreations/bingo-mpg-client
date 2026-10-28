import React from "react";

function WaitingRoom({ roomId, copiedCode, onCopyCode, onCancel }) {
  return (
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
            <span className="code-text">{roomId}</span>
            <button
              type="button"
              className="copy-invite-btn"
              onClick={onCopyCode}
            >
              {copiedCode ? "✓ Copied to Clipboard" : "📋 Copy Code"}
            </button>
          </div>
        </div>

        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel & Back to Lobby
        </button>
      </div>
    </main>
  );
}

export default WaitingRoom;
