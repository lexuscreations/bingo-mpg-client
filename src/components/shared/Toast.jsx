import React from "react";
import CoinIcon from "./CoinIcon";

function Toast({ message }) {
  if (!message) return null;

  const isCoinToss = message.includes("Coin Toss");
  const isAlternating = message.includes("Alternating");
  const isWinner = message.includes("Winner Starts");
  const isHost = message.includes("Host Starts");

  return (
    <div className="game-toast">
      <span className="toast-icon">
        {isCoinToss ? (
          <CoinIcon size={16} />
        ) : isAlternating ? (
          "🔄"
        ) : isWinner ? (
          "👑"
        ) : isHost ? (
          "👤"
        ) : (
          "✨"
        )}
      </span>
      <span className="toast-text">{message}</span>
    </div>
  );
}

export default Toast;
