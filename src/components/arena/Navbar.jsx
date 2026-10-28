import React, { useState, useEffect, useRef } from "react";
import ThemeToggle from "../shared/ThemeToggle";
import CoinIcon from "../shared/CoinIcon";
import { getTurnRuleInfo, formatTurnToast } from "../../utils/turnRules";
import { formatTime } from "../../utils/playerStatus";

function Navbar({
  roomId,
  firstTurnRule,
  turnReason,
  starterPlayerName,
  currentTime,
  soundActive,
  onToggleSound,
  onLeaveRoom,
  onCopyCode,
  copiedCode,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const ruleMeta = getTurnRuleInfo(firstTurnRule);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="game-navbar">
      <div className="nav-left">
        <div className="game-brand">
          <span className="brand-badge">B</span>
          <span className="brand-name">BINGO</span>
        </div>

        <div
          className="room-badge"
          onClick={onCopyCode}
          title="Click to copy room code"
        >
          <span className="room-label">ROOM</span>
          <span className="room-code">{roomId}</span>
          <button type="button" className="copy-btn">
            {copiedCode ? "✓ Copied" : "📋"}
          </button>
        </div>

        {/* Turn Rule Badge */}
        <div
          className="turn-rule-badge"
          title={`${ruleMeta.title}${
            turnReason
              ? `\n• ${formatTurnToast(turnReason, starterPlayerName)}`
              : ""
          }`}
        >
          <span className="turn-rule-icon">
            {firstTurnRule === "random" ? (
              <CoinIcon size={14} />
            ) : (
              ruleMeta.icon
            )}
          </span>
          <span className="turn-rule-text">{ruleMeta.label}</span>
        </div>
      </div>

      <div className="nav-right">
        <div className="timer-badge">
          <span className="timer-icon">⏱️</span>
          <span className="timer-text">{formatTime(currentTime)}</span>
        </div>

        {/* Desktop Controls (Inline on screen >= 680px) */}
        <div className="desktop-controls">
          <button
            type="button"
            className="sound-toggle-btn"
            onClick={onToggleSound}
            title={soundActive ? "Mute Sounds" : "Unmute Sounds"}
            aria-label={soundActive ? "Mute sounds" : "Unmute sounds"}
          >
            {soundActive ? "🔊" : "🔇"}
          </button>

          <ThemeToggle />

          <button
            type="button"
            className="leave-btn"
            onClick={onLeaveRoom}
            title="Leave room and return to lobby"
          >
            Exit 🚪
          </button>
        </div>

        {/* Mobile Action Menu (Collapsed on screen < 680px) */}
        <div className="mobile-menu-container" ref={menuRef}>
          <button
            type="button"
            className={`mobile-menu-trigger ${menuOpen ? "is-active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Open game options menu"
            title="Game options"
          >
            <span className="menu-kebab-dots">⋮</span>
          </button>

          {menuOpen && (
            <div className="mobile-dropdown-menu">
              <div
                className="menu-item"
                onClick={() => {
                  onToggleSound();
                }}
              >
                <span className="menu-item-icon">
                  {soundActive ? "🔊" : "🔇"}
                </span>
                <span className="menu-item-label">
                  Sound: {soundActive ? "Enabled" : "Muted"}
                </span>
                <span className="menu-item-toggle-pill">
                  {soundActive ? "ON" : "OFF"}
                </span>
              </div>

              <div className="menu-item menu-item-theme">
                <span className="menu-item-icon">🎨</span>
                <span className="menu-item-label">Theme</span>
                <ThemeToggle />
              </div>

              <div className="menu-divider" />

              <div
                className="menu-item menu-item-danger"
                onClick={() => {
                  setMenuOpen(false);
                  onLeaveRoom();
                }}
              >
                <span className="menu-item-icon">🚪</span>
                <span className="menu-item-label">Exit Match</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
