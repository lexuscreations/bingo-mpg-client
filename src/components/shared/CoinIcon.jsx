import React from "react";

export function CoinIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ display: "inline-block", verticalAlign: "-0.15em" }}
      aria-label="Coin Toss"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="7.5"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1"
        strokeDasharray="2 1.5"
      />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="#78350f"
        fontSize="12"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ¢
      </text>
    </svg>
  );
}

export default CoinIcon;
