"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "purple-aurora:audio-preference";

type StoredAudioPreference = {
  enabled: boolean;
  volume: number;
};

type AmbientGraph = {
  context: AudioContext;
  master: GainNode;
  oscillators: OscillatorNode[];
  intervalId: number;
};

function readPreference(): StoredAudioPreference {
  if (typeof window === "undefined") return { enabled: false, volume: 0.28 };

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { enabled: false, volume: 0.28 };
    const parsed = JSON.parse(saved) as Partial<StoredAudioPreference>;
    return {
      // Browsers require a fresh gesture before audio can begin.
      enabled: false,
      volume:
        typeof parsed.volume === "number"
          ? Math.min(0.7, Math.max(0, parsed.volume))
          : 0.28,
    };
  } catch {
    return { enabled: false, volume: 0.28 };
  }
}

export function useAmbientAudio() {
  const [preference, setPreference] = useState<StoredAudioPreference>({
    enabled: false,
    volume: 0.28,
  });
  const [ready, setReady] = useState(false);
  const graphRef = useRef<AmbientGraph | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setPreference(readPreference());
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const stop = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;

    window.clearInterval(graph.intervalId);
    const now = graph.context.currentTime;
    graph.master.gain.cancelScheduledValues(now);
    graph.master.gain.setValueAtTime(graph.master.gain.value, now);
    graph.master.gain.linearRampToValueAtTime(0.0001, now + 0.7);

    window.setTimeout(() => {
      graph.oscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch {
          // The node may already have been stopped during page teardown.
        }
      });
      void graph.context.close();
    }, 760);
    graphRef.current = null;
  }, []);

  const start = useCallback(async (volume: number) => {
    if (graphRef.current || typeof window === "undefined") return true;

    const AudioContextClass =
      window.AudioContext ??
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioContextClass) return false;

    try {
      const context = new AudioContextClass();
      await context.resume();
      const master = context.createGain();
      const warmth = context.createBiquadFilter();
      const oscillators: OscillatorNode[] = [];

      master.gain.setValueAtTime(0.0001, context.currentTime);
      master.gain.linearRampToValueAtTime(
        Math.max(0.0001, volume * 0.08),
        context.currentTime + 1.1,
      );
      warmth.type = "lowpass";
      warmth.frequency.value = 850;
      warmth.Q.value = 0.5;
      warmth.connect(master);
      master.connect(context.destination);

      [110, 164.81, 220].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const oscillatorGain = context.createGain();
        oscillator.type = index === 1 ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        oscillator.detune.value = index * 3 - 3;
        oscillatorGain.gain.value = index === 2 ? 0.16 : 0.25;
        oscillator.connect(oscillatorGain);
        oscillatorGain.connect(warmth);
        oscillator.start();
        oscillators.push(oscillator);
      });

      const intervalId = window.setInterval(() => {
        if (context.state !== "running") return;
        const shimmer = context.createOscillator();
        const shimmerGain = context.createGain();
        const frequencies = [659.25, 783.99, 987.77, 1046.5];
        shimmer.frequency.value =
          frequencies[Math.floor(Math.random() * frequencies.length)];
        shimmer.type = "sine";
        const now = context.currentTime;
        shimmerGain.gain.setValueAtTime(0.0001, now);
        shimmerGain.gain.exponentialRampToValueAtTime(0.025, now + 0.08);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
        shimmer.connect(shimmerGain);
        shimmerGain.connect(master);
        shimmer.start(now);
        shimmer.stop(now + 2.5);
      }, 6800);

      graphRef.current = {
        context,
        master,
        oscillators,
        intervalId,
      };
      return true;
    } catch {
      return false;
    }
  }, []);

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      const next = { ...preference, enabled };
      if (enabled) {
        const didStart = await start(preference.volume);
        if (!didStart) return false;
      } else {
        stop();
      }
      setPreference(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return true;
    },
    [preference, start, stop],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const safeVolume = Math.min(0.7, Math.max(0, volume));
      const next = { ...preference, volume: safeVolume };
      const graph = graphRef.current;
      if (graph) {
        graph.master.gain.setTargetAtTime(
          Math.max(0.0001, safeVolume * 0.08),
          graph.context.currentTime,
          0.12,
        );
      }
      setPreference(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    [preference],
  );

  useEffect(() => stop, [stop]);

  return {
    enabled: preference.enabled,
    volume: preference.volume,
    ready,
    setEnabled,
    setVolume,
  };
}
