export const FUN_NAMES = [
  "LuckyTiger",
  "BingoKing",
  "SpeedyFox",
  "GoldenAce",
  "StarGazer",
  "NeonStrike",
  "PixelHero",
  "CyberWolf",
  "ShadowBlaze",
  "CosmicRider",
  "ThunderHawk",
  "MysticOwl",
];

export const AI_OPPONENTS = [
  {
    id: "random",
    name: "Random AI",
    icon: "🎲",
    desc: "Casual & unpredictable",
  },
  {
    id: "pattern",
    name: "Pattern AI",
    icon: "🎯",
    desc: "Strategic targeted lines",
  },
  {
    id: "smart",
    name: "Smart AI",
    icon: "🧠",
    desc: "Tactical & competitive",
  },
];

export const PATTERNS = [
  { id: "", name: "Random Pattern", icon: "🎲", desc: "Adaptive" },
  { id: "Alice", name: "Alice", icon: "↔️", desc: "Row Strategy" },
  { id: "Mike", name: "Mike", icon: "↕️", desc: "Column Strategy" },
  { id: "Lisa", name: "Lisa", icon: "🔲", desc: "Boundary Strategy" },
  { id: "Anna", name: "Anna", icon: "↗️", desc: "Diagonal Strategy" },
  { id: "Tom", name: "Tom", icon: "⛶", desc: "Corner Strategy" },
  { id: "Emma", name: "Emma", icon: "🎯", desc: "Center Strategy" },
];

export const FIRST_TURN_RULES = [
  {
    id: "alternating",
    name: "Fair Alternating",
    icon: "🔄",
    desc: "Coin Toss on Game 1, then swaps every rematch",
    badge: "Fair Play",
  },
  {
    id: "random",
    name: "50/50 Coin Toss",
    icon: "🪙",
    desc: "Fresh random coin toss every single game",
  },
  {
    id: "winner",
    name: "Winner Starts",
    icon: "👑",
    desc: "Coin Toss first, then last game winner starts",
  },
  {
    id: "host",
    name: "Host Starts",
    icon: "👤",
    desc: "Room creator always takes the first turn",
  },
];
