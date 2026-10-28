import React from "react";
import { AI_OPPONENTS, PATTERNS } from "../../config/constants";

function AIOpponentSelector({
  aiOpponentType,
  onAiTypeChange,
  selectedPattern,
  onPatternChange,
  styles,
}) {
  return (
    <div className={styles.sectionBox}>
      <span className={styles.subLabel}>Choose AI Opponent:</span>
      <div className={styles.aiCardsGrid}>
        {AI_OPPONENTS.map((ai) => {
          const isSelected = aiOpponentType === ai.id;
          return (
            <button
              key={ai.id}
              type="button"
              className={`${styles.aiCard} ${isSelected ? styles.aiActive : ""}`}
              onClick={() => onAiTypeChange(ai.id)}
            >
              <span className={styles.aiIcon}>{ai.icon}</span>
              <strong className={styles.aiTitle}>{ai.name}</strong>
              <small className={styles.aiDesc}>{ai.desc}</small>
              {isSelected && <span className={styles.aiCheck}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Specific Pattern selection when pattern opponent is chosen */}
      {aiOpponentType === "pattern" && (
        <div className={styles.patternBox}>
          <span className={styles.patternHeader}>
            Choose Specific Pattern Strategy:
          </span>
          <div className={styles.patternGrid}>
            {PATTERNS.map((pattern) => {
              const isSelected = selectedPattern === pattern.id;
              return (
                <button
                  key={pattern.id}
                  type="button"
                  className={`${styles.patternChip} ${isSelected ? styles.patternActive : ""}`}
                  onClick={() => onPatternChange(pattern.id)}
                >
                  <span className={styles.patternIcon}>{pattern.icon}</span>
                  <div className={styles.patternText}>
                    <strong>{pattern.name}</strong>
                    <small>{pattern.desc}</small>
                  </div>
                  {isSelected && <span className={styles.patternCheck}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIOpponentSelector;
