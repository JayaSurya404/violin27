"use client";

type ToneOptions = {
  frequency: number;
  duration?: number;
  gain?: number;
  type?: OscillatorType;
  delay?: number;
};

let sharedContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!AudioContextClass) return null;
  sharedContext ??= new AudioContextClass();
  return sharedContext;
}

export async function ensureAudioContext() {
  const context = getAudioContext();
  if (context?.state === "suspended") {
    await context.resume();
  }
  return context;
}

export async function playTone({
  frequency,
  duration = 0.7,
  gain = 0.035,
  type = "sine",
  delay = 0,
}: ToneOptions) {
  const context = await ensureAudioContext();
  if (!context) return;

  const startTime = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  volume.gain.setValueAtTime(0.0001, startTime);
  volume.gain.exponentialRampToValueAtTime(gain, startTime + 0.04);
  volume.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + Math.max(0.08, duration),
  );

  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.08);
}

function safelyPlayTone(options: ToneOptions) {
  void playTone(options).catch(() => {
    // Sound is optional; gesture and browser policies may reject playback.
  });
}

export function playChime() {
  safelyPlayTone({ frequency: 523.25, duration: 1.15, gain: 0.028 });
  safelyPlayTone({
    frequency: 783.99,
    duration: 1.3,
    gain: 0.018,
    delay: 0.09,
  });
}

export function playPulse() {
  safelyPlayTone({
    frequency: 196,
    duration: 0.28,
    gain: 0.02,
    type: "sine",
  });
}

export function playPaper() {
  safelyPlayTone({
    frequency: 286,
    duration: 0.32,
    gain: 0.012,
    type: "triangle",
  });
  safelyPlayTone({
    frequency: 362,
    duration: 0.45,
    gain: 0.009,
    type: "sine",
    delay: 0.08,
  });
}

export function playCelebration() {
  [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
    safelyPlayTone({
      frequency,
      duration: 1.35,
      gain: 0.018,
      delay: index * 0.12,
    });
  });
}
