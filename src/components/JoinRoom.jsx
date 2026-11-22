import { useState, useEffect } from "react";

import Button from "./shared/Button";
import ThemeToggle from "./shared/ThemeToggle";

import {
  generateRoomIdOptions,
  validateRoomIdFormat,
} from "../utils/roomIdGenerator";
import { BACKEND_URL } from "../utils/config";

import styles from "./JoinRoom.module.scss";

import { FUN_NAMES } from "../config/constants";
import AIOpponentSelector from "./lobby/AIOpponentSelector";
import TurnRuleSelector from "./lobby/TurnRuleSelector";


function JoinRoom({ onCreateRoom, onJoinRoom }) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [customRoomId, setCustomRoomId] = useState("");
  const [useCustomRoomId, setUseCustomRoomId] = useState(false);
  const [roomIdError, setRoomIdError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [suggestedRoomIds, setSuggestedRoomIds] = useState([]);

  // Game mode, AI, & turn rule states
  const [gameMode, setGameMode] = useState("friend"); // 'friend' or 'computer'
  const [aiOpponentType, setAiOpponentType] = useState("random"); // 'random', 'pattern', 'smart'
  const [selectedPattern, setSelectedPattern] = useState("");
  const [firstTurnRule, setFirstTurnRule] = useState("alternating");

  // Generate suggested room IDs on mount & when in create mode
  useEffect(() => {
    if (!isJoining && gameMode === "friend") {
      setSuggestedRoomIds(generateRoomIdOptions(3));
    }
  }, [isJoining, gameMode]);

  // Validate custom room ID with debounce
  useEffect(() => {
    if (useCustomRoomId && customRoomId) {
      const timeoutId = setTimeout(() => {
        validateCustomRoomId(customRoomId);
      }, 400);
      return () => clearTimeout(timeoutId);
    } else if (useCustomRoomId && !customRoomId) {
      setRoomIdError("");
    }
  }, [customRoomId, useCustomRoomId]);

  const validateCustomRoomId = async (id) => {
    if (!id.trim()) {
      setRoomIdError("");
      return;
    }

    if (!validateRoomIdFormat(id)) {
      setRoomIdError("Room ID must be 3-16 letters & numbers");
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/validate-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists || !data.valid) {
          setRoomIdError(data.error || "Room ID already taken");
        } else {
          setRoomIdError("");
        }
      } else {
        setRoomIdError("");
      }
    } catch {
      // Backend validation endpoint fallback (allow offline/local)
      setRoomIdError("");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRandomName = () => {
    const randomPick = FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
    const randomNum = Math.floor(Math.random() * 90 + 10);
    setName(`${randomPick}${randomNum}`);
  };

  const handleSuggestedRoomIdClick = (suggestedId) => {
    if (customRoomId === suggestedId && useCustomRoomId) {
      // Deselect if already active
      setCustomRoomId("");
      setUseCustomRoomId(false);
    } else {
      setCustomRoomId(suggestedId);
      setUseCustomRoomId(true);
      setRoomIdError("");
    }
  };

  const handleGenerateNewSuggestions = () => {
    setSuggestedRoomIds(generateRoomIdOptions(3));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isJoining && gameMode === "friend") {
      if (!roomId.trim()) return;
      onJoinRoom(roomId.trim().toUpperCase(), name.trim());
    } else {
      if (gameMode === "computer") {
        const aiConfig = {
          type: aiOpponentType,
          pattern: aiOpponentType === "pattern" ? selectedPattern : null,
        };
        onCreateRoom(name.trim(), null, aiConfig, firstTurnRule);
      } else {
        const finalRoomId = useCustomRoomId
          ? customRoomId.trim().toUpperCase()
          : null;
        onCreateRoom(name.trim(), finalRoomId, null, firstTurnRule);
      }
    }
  };

  return (
    <main className={styles.joinRoom}>
      <div className={styles.card}>
        {/* Floating Theme Switcher */}
        <div className={styles.topBar}>
          <ThemeToggle />
        </div>

        {/* Hero Header */}
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <span className={styles.logoLetter}>B</span>
            <span className={styles.logoSparkle}>✨</span>
          </div>
          <h1 className={styles.title}>Welcome to Bingo!</h1>
          <p className={styles.subtitle}>
            Real-time multiplayer & intelligent AI matches
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Player Name Input */}
          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="playerName" className={styles.fieldLabel}>
                Your Name
              </label>
              <button
                type="button"
                className={styles.diceButton}
                onClick={handleRandomName}
                title="Generate random name"
              >
                <span>🎲</span> Random Name
              </button>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>👤</span>
              <input
                type="text"
                id="playerName"
                name="playerName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
                maxLength={24}
                autoComplete="name"
                placeholder="Enter your name (e.g. Alex, LuckyStar)"
              />
            </div>
          </div>

          {/* Mode Selector (Friend vs Computer) */}
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Choose Game Mode</span>
            <div className={styles.modeCardsGrid}>
              <button
                type="button"
                className={`${styles.modeCard} ${gameMode === "friend" ? styles.modeActive : ""}`}
                onClick={() => setGameMode("friend")}
              >
                <div className={styles.modeIcon}>👥</div>
                <div className={styles.modeDetails}>
                  <strong>Play with Friend</strong>
                  <small>Private 1v1 Room</small>
                </div>
                {gameMode === "friend" && (
                  <span className={styles.checkPill}>✓</span>
                )}
              </button>

              <button
                type="button"
                className={`${styles.modeCard} ${gameMode === "computer" ? styles.modeActive : ""}`}
                onClick={() => setGameMode("computer")}
              >
                <div className={styles.modeIcon}>🤖</div>
                <div className={styles.modeDetails}>
                  <strong>Play with Computer</strong>
                  <small>Solo Practice Match</small>
                </div>
                {gameMode === "computer" && (
                  <span className={styles.checkPill}>✓</span>
                )}
              </button>
            </div>
          </div>

          {/* SECTION: PLAY WITH FRIEND */}
          {gameMode === "friend" && (
            <div className={styles.sectionBox}>
              {/* Tabs: Create vs Join */}
              <div className={styles.tabSwitch}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${!isJoining ? styles.tabActive : ""}`}
                  onClick={() => {
                    setIsJoining(false);
                    setRoomIdError("");
                  }}
                >
                  🏠 Create Room
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${isJoining ? styles.tabActive : ""}`}
                  onClick={() => {
                    setIsJoining(true);
                    setRoomIdError("");
                  }}
                >
                  🔑 Join Existing Room
                </button>
              </div>

              {!isJoining ? (
                /* Create Room Details */
                <div className={styles.roomCreateDetails}>
                  <div className={styles.subField}>
                    <div className={styles.labelRow}>
                      <span className={styles.subLabel}>
                        Suggested Room IDs:
                      </span>
                      <button
                        type="button"
                        className={styles.refreshBtn}
                        onClick={handleGenerateNewSuggestions}
                        title="Generate new suggestions"
                      >
                        🔄 Refresh
                      </button>
                    </div>

                    <div className={styles.suggestedList}>
                      {suggestedRoomIds.map((suggestedId) => {
                        const isSelected =
                          customRoomId === suggestedId && useCustomRoomId;
                        return (
                          <button
                            key={suggestedId}
                            type="button"
                            className={`${styles.suggestedChip} ${isSelected ? styles.chipSelected : ""}`}
                            onClick={() =>
                              handleSuggestedRoomIdClick(suggestedId)
                            }
                          >
                            <span className={styles.chipText}>
                              {suggestedId}
                            </span>
                            {isSelected && (
                              <span className={styles.chipCheck}>✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.dividerRow}>
                    <span>OR CUSTOMIZE ROOM ID</span>
                  </div>

                  <div className={styles.subField}>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>#</span>
                      <input
                        type="text"
                        value={customRoomId}
                        onChange={(e) => {
                          setCustomRoomId(e.target.value.toUpperCase());
                          setUseCustomRoomId(true);
                        }}
                        className={`${styles.input} ${roomIdError ? styles.inputError : ""}`}
                        placeholder="Enter custom room ID (3-16 chars)"
                        maxLength={16}
                      />
                      {isValidating && (
                        <span className={styles.inputBadgeLoading}>
                          ⏳ Checking...
                        </span>
                      )}
                      {useCustomRoomId &&
                        customRoomId &&
                        !isValidating &&
                        !roomIdError && (
                          <span className={styles.inputBadgeSuccess}>
                            ✓ Valid
                          </span>
                        )}
                    </div>
                    {roomIdError && (
                      <p className={styles.errorText}>⚠️ {roomIdError}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Join Room Details */
                <div className={styles.roomJoinDetails}>
                  <div className={styles.subField}>
                    <label htmlFor="roomId" className={styles.subLabel}>
                      Enter Room Code
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>🔑</span>
                      <input
                        type="text"
                        id="roomId"
                        name="roomId"
                        value={roomId}
                        onChange={(e) =>
                          setRoomId(e.target.value.toUpperCase())
                        }
                        required={isJoining}
                        className={`${styles.input} ${styles.inputCode}`}
                        placeholder="e.g. FRESHDEER9685"
                        maxLength={16}
                      />
                    </div>
                    <small className={styles.hintText}>
                      Ask your friend for the room code they generated.
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: PLAY WITH COMPUTER */}
          {gameMode === "computer" && (
            <AIOpponentSelector
              aiOpponentType={aiOpponentType}
              onAiTypeChange={setAiOpponentType}
              selectedPattern={selectedPattern}
              onPatternChange={setSelectedPattern}
              styles={styles}
            />
          )}

          {/* SECTION: FIRST TURN RULE (Configured by Host when creating room) */}
          {!isJoining && (
            <TurnRuleSelector
              firstTurnRule={firstTurnRule}
              onChange={setFirstTurnRule}
              styles={styles}
            />
          )}

          {/* Main Action Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className={styles.submitBtn}
            disabled={
              !name.trim() ||
              (isJoining && gameMode === "friend" && !roomId.trim()) ||
              (gameMode === "friend" &&
                !isJoining &&
                useCustomRoomId &&
                (!!roomIdError || isValidating))
            }
          >
            {isJoining
              ? "Join Room 🚀"
              : gameMode === "computer"
                ? "Play with Computer ⚔️"
                : "Create Room ✨"}
          </Button>
        </form>
      </div>
    </main>
  );
}

export default JoinRoom;
