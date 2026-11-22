// Web Audio API Sound Synthesizer for rich, zero-latency tactile feedback
// Works in all modern browsers without requiring external MP3/WAV assets

let audioCtx = null;
let soundEnabled = true;

// Initialize or resume audio context on first user gesture
function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Load saved sound preference
try {
  const saved = localStorage.getItem("bingo_sound_enabled");
  if (saved !== null) {
    soundEnabled = JSON.parse(saved);
  }
} catch {
  soundEnabled = true;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  try {
    localStorage.setItem("bingo_sound_enabled", JSON.stringify(soundEnabled));
  } catch {
    // Ignore storage errors
  }
  return soundEnabled;
}

export function toggleSound() {
  return setSoundEnabled(!soundEnabled);
}

// 1. Tactile tile click (marimba pop)
export function playTileClick() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

// 2. Turn change chime (friendly notification when your turn starts)
export function playYourTurnSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25]; // C5 -> E5

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    gain.gain.setValueAtTime(0, now + idx * 0.12);
    gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 0.25);
  });
}

// 3. Line completed chime (C major sparkle when a row/col/diag is completed)
export function playLineCompleteSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.09);

    gain.gain.setValueAtTime(0.01, now + idx * 0.09);
    gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.09 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.09);
    osc.stop(now + idx * 0.09 + 0.45);
  });
}

// 4. Victory celebration fanfare!
export function playVictorySound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 523.25, time: 0, dur: 0.15 }, // C5
    { freq: 659.25, time: 0.15, dur: 0.15 }, // E5
    { freq: 783.99, time: 0.3, dur: 0.15 }, // G5
    { freq: 1046.5, time: 0.45, dur: 0.45 }, // C6
    { freq: 1318.5, time: 0.7, dur: 0.6 }, // E6
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0.01, now + time);
    gain.gain.linearRampToValueAtTime(0.3, now + time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}
