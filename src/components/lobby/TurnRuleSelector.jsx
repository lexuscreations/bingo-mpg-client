import React, { useState } from "react";
import CoinIcon from "../shared/CoinIcon";
import { FIRST_TURN_RULES } from "../../config/constants";

function TurnRuleSelector({ firstTurnRule, onChange, styles }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentRule =
    FIRST_TURN_RULES.find((r) => r.id === firstTurnRule) ||
    FIRST_TURN_RULES[0];

  return (
    <div
      className={`${styles.sectionBox} ${styles.accordionSection} ${isOpen ? styles.accordionSectionOpen : ""}`}
    >
      <button
        type="button"
        className={styles.accordionTrigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="turn-rule-accordion-body"
      >
        <div className={styles.subLabelRow}>
          <span className={styles.subLabel}>Who Plays First?</span>
          <span className={styles.ruleBadge}>🎯 Turn Rule</span>
        </div>

        <div className={styles.accordionRight}>
          <div
            className={styles.selectedRulePreview}
            title={`Selected: ${currentRule.name}`}
          >
            <span className={styles.previewIcon}>
              {currentRule.id === "random" ? (
                <CoinIcon size={14} />
              ) : (
                currentRule.icon
              )}
            </span>
            <span className={styles.previewText}>{currentRule.name}</span>
          </div>

          <svg
            className={`${styles.accordionChevron} ${isOpen ? styles.chevronOpen : ""}`}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <div
        id="turn-rule-accordion-body"
        className={`${styles.accordionBody} ${isOpen ? styles.accordionBodyOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.turnRuleGrid}>
          {FIRST_TURN_RULES.map((rule) => {
            const isSelected = firstTurnRule === rule.id;
            return (
              <button
                key={rule.id}
                type="button"
                className={`${styles.turnRuleCard} ${isSelected ? styles.turnRuleActive : ""}`}
                onClick={() => onChange(rule.id)}
              >
                <div className={styles.turnRuleTop}>
                  <div className={styles.turnRuleHeader}>
                    <span className={styles.turnRuleIcon}>
                      {rule.id === "random" ? (
                        <CoinIcon size={16} />
                      ) : (
                        rule.icon
                      )}
                    </span>
                    <strong
                      className={styles.turnRuleTitle}
                      title={rule.name}
                    >
                      {rule.name}
                    </strong>
                  </div>
                  <div className={styles.turnRuleMeta}>
                    {rule.badge && (
                      <span className={styles.recBadge}>{rule.badge}</span>
                    )}
                    {isSelected && <span className={styles.ruleCheck}>✓</span>}
                  </div>
                </div>
                <small className={styles.turnRuleDesc}>{rule.desc}</small>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TurnRuleSelector;

