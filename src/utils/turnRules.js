import { FIRST_TURN_RULES } from "../config/constants";

export { FIRST_TURN_RULES };

export function getTurnRuleInfo(rule) {
  switch (rule) {
    case "random":
      return {
        icon: "🪙",
        label: "Coin Toss",
        title: "First Turn: 50/50 Coin Toss on every match",
      };
    case "winner":
      return {
        icon: "👑",
        label: "Winner Starts",
        title: "First Turn: Coin toss first, then last game winner starts",
      };
    case "host":
      return {
        icon: "👤",
        label: "Host Starts",
        title: "First Turn: Room creator always plays first",
      };
    case "alternating":
    default:
      return {
        icon: "🔄",
        label: "Fair Alternating",
        title: "First Turn: Coin Toss on Game 1, then swaps every rematch",
      };
  }
}

export function formatTurnToast(turnReason, starterPlayerName) {
  const starter = starterPlayerName || "First player";
  switch (turnReason) {
    case "coin_toss":
      return `Coin Toss: ${starter} won the toss and plays first!`;
    case "alternating":
      return `Alternating: ${starter}'s turn to start this match!`;
    case "winner":
      return `Winner Starts: ${starter} won the last game and plays first!`;
    case "host":
      return `Host Starts: ${starter} created the room and plays first!`;
    default:
      if (typeof turnReason === "string" && turnReason.length > 10) {
        return turnReason;
      }
      return `Match Started: ${starter} takes the first turn!`;
  }
}

