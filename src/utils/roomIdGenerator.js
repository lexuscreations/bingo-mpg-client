// Generate short, memorable room IDs similar to Google Meet
// Format: 3-4 letters + 3-4 numbers (e.g., "ABC123", "XY789")

const ADJECTIVES = [
  "BIG",
  "RED",
  "BLUE",
  "GREEN",
  "FAST",
  "SLOW",
  "HOT",
  "COLD",
  "WARM",
  "COOL",
  "BOLD",
  "WISE",
  "KIND",
  "BRAVE",
  "CALM",
  "WILD",
  "CUTE",
  "FINE",
  "GOOD",
  "NICE",
  "TALL",
  "WIDE",
  "DEEP",
  "HIGH",
  "LOW",
  "THIN",
  "THICK",
  "LONG",
  "SHORT",
  "NEW",
  "OLD",
  "YOUNG",
  "FRESH",
  "CLEAN",
  "PURE",
  "RICH",
  "POOR",
  "FULL",
  "EMPTY",
  "FREE",
];

const NOUNS = [
  "CAT",
  "DOG",
  "BIRD",
  "FISH",
  "BEAR",
  "LION",
  "TIGER",
  "WOLF",
  "FOX",
  "DEER",
  "TREE",
  "ROSE",
  "STAR",
  "MOON",
  "SUN",
  "SKY",
  "SEA",
  "LAKE",
  "RIVER",
  "HILL",
  "ROCK",
  "GOLD",
  "SILVER",
  "IRON",
  "WOOD",
  "STONE",
  "GLASS",
  "PAPER",
  "CLOTH",
  "LEATHER",
  "CROWN",
  "RING",
  "CUP",
  "BOWL",
  "PLATE",
  "SPOON",
  "FORK",
  "KNIFE",
  "SWORD",
  "SHIELD",
];

const NUMBERS = "0123456789";

/**
 * Generate a short, memorable room ID
 * Format: 3-4 letters + 3-4 numbers (e.g., "BIGCAT123", "REDROSE456")
 */
export function generateShortRoomId() {
  // Randomly choose between adjective + noun or noun + adjective
  const useAdjectiveFirst = Math.random() < 0.5;

  let roomId;
  if (useAdjectiveFirst) {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    roomId = adjective + noun;
  } else {
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    roomId = noun + adjective;
  }

  // Add 3-4 random numbers
  const numLength = Math.random() < 0.5 ? 3 : 4;
  for (let i = 0; i < numLength; i++) {
    roomId += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  }

  return roomId;
}

/**
 * Generate multiple room IDs for user to choose from
 */
export function generateRoomIdOptions(count = 3) {
  const options = new Set();
  while (options.size < count) {
    options.add(generateShortRoomId());
  }
  return Array.from(options);
}

/**
 * Validate room ID format
 * Must be 3-16 characters, alphanumeric and hyphens only
 */
export function validateRoomIdFormat(roomId) {
  if (!roomId || typeof roomId !== "string") return false;
  if (roomId.length < 3 || roomId.length > 16) return false;
  return /^[A-Za-z0-9-]+$/.test(roomId);
}

/**
 * Check if room ID is memorable (has both letters and numbers)
 */
export function isMemorableRoomId(roomId) {
  if (!validateRoomIdFormat(roomId)) return false;
  return /[A-Z]/.test(roomId) && /[0-9]/.test(roomId);
}
