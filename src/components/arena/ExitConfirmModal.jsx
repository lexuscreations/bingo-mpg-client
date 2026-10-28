import React, { useEffect } from "react";

function ExitConfirmModal({ isOpen, onConfirm, onCancel }) {
  // Lock body scroll while modal is active to eliminate global scrollbars
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="exit-confirm-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-modal-title"
      >
        <div className="exit-icon-badge">🚪</div>
        <h3 id="exit-modal-title" className="exit-title">
          Exit Match?
        </h3>
        <p className="exit-desc">
          Leaving now will forfeit the game to your opponent.
          <br />
          <span className="exit-warning">
            Are you sure you want to return to the lobby?
          </span>
        </p>
        <div className="exit-modal-actions">
          <button
            type="button"
            className="exit-cancel-btn"
            onClick={onCancel}
          >
            Stay in Game
          </button>
          <button
            type="button"
            className="exit-forfeit-btn"
            onClick={onConfirm}
          >
            <span className="btn-text">Forfeit & Exit</span>
            <span className="btn-door-icon">🚪</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExitConfirmModal;
