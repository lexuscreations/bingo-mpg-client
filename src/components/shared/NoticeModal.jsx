import React, { useEffect } from "react";

function NoticeModal({ notice, onClose }) {
  // Lock body scroll while notice modal is active
  useEffect(() => {
    if (notice) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [notice]);

  if (!notice) return null;

  const { title = "Notice", message, icon = "⚠️" } = notice;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="notice-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-modal-title"
      >
        <div className="notice-icon-badge">{icon}</div>
        <h3 id="notice-modal-title" className="notice-title">
          {title}
        </h3>
        <p className="notice-message">{message}</p>
        <div className="notice-actions">
          <button
            type="button"
            className="notice-ok-btn"
            onClick={onClose}
            autoFocus
          >
            Got it 👍
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoticeModal;
