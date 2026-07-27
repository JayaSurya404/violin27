"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/src/config/site";

const STORAGE_KEY = siteConfig.music.preferenceStorageKey;
const DEFAULT_VOLUME = siteConfig.music.defaultVolume;
const FADE_IN_SECONDS = siteConfig.music.fadeInMs / 1000;
const FADE_OUT_SECONDS = siteConfig.music.fadeOutMs / 1000;

type StoredAudioPreference = {
  enabled: boolean;
  volume: number;
};

type AmbientGraph = {
  context: AudioContext;
  master: GainNode;
  oscillators: OscillatorNode[];
  shimmerTimerId: number;
  shimmers: Set<{
    gain: GainNode;
    oscillator: OscillatorNode;
  }>;
};

function readPreference(): StoredAudioPreference {
  if (typeof window === "undefined") {
    return { enabled: false, volume: DEFAULT_VOLUME };
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { enabled: false, volume: DEFAULT_VOLUME };
    const parsed = JSON.parse(saved) as Partial<StoredAudioPreference>;
    return {
      // Browsers require a fresh gesture before audio can begin.
      enabled: false,
      volume:
        typeof parsed.volume === "number"
          ? Math.min(0.7, Math.max(0, parsed.volume))
          : DEFAULT_VOLUME,
    };
  } catch {
    return { enabled: false, volume: DEFAULT_VOLUME };
  }
}

export function useAmbientAudio() {
  const [preference, setPreference] = useState<StoredAudioPreference>({
    enabled: false,
    volume: DEFAULT_VOLUME,
  });
  const [ready, setReady] = useState(false);
  const graphRef = useRef<AmbientGraph | null>(null);
  const startingRef = useRef<Promise<boolean> | null>(null);
  const startTokenRef = useRef(0);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setPreference(readPreference());
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const stop = useCallback(() => {
    startTokenRef.current += 1;
    const graph = graphRef.current;
    if (!graph) return;

    window.clearTimeout(graph.shimmerTimerId);
    graph.shimmers.forEach(({ gain, oscillator }) => {
      try {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();
      } catch {
        // The shimmer may already have finished naturally.
      }
    });
    graph.shimmers.clear();
    const now = graph.context.currentTime;
    graph.master.gain.cancelScheduledValues(now);
    graph.master.gain.setValueAtTime(graph.master.gain.value, now);
    graph.master.gain.linearRampToValueAtTime(
      0.0001,
      now + FADE_OUT_SECONDS,
    );

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
    }, siteConfig.music.fadeOutMs + 60);
    graphRef.current = null;
  }, []);

  const start = useCallback(async (volume: number) => {
    if (graphRef.current || typeof window === "undefined") return true;
    if (startingRef.current) return startingRef.current;
    const startToken = startTokenRef.current + 1;
    startTokenRef.current = startToken;

    const pendingStart = (async () => {
      const AudioContextClass =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
      ).webkitAudioContext;
      if (!AudioContextClass) return false;

      let pendingContext: AudioContext | null = null;
      try {
        const context = new AudioContextClass();
        pendingContext = context;
        await context.resume();
        if (startToken !== startTokenRef.current) {
          void context.close();
          return false;
        }
        const master = context.createGain();
        const limiter = context.createDynamicsCompressor();
        const warmth = context.createBiquadFilter();
        const oscillators: OscillatorNode[] = [];
        const shimmers: AmbientGraph["shimmers"] = new Set();

        master.gain.setValueAtTime(0.0001, context.currentTime);
        master.gain.linearRampToValueAtTime(
          Math.max(0.0001, volume * 0.08),
          context.currentTime + FADE_IN_SECONDS,
        );
        limiter.threshold.value = -24;
        limiter.knee.value = 18;
        limiter.ratio.value = 3;
        limiter.attack.value = 0.006;
        limiter.release.value = 0.28;
        warmth.type = "lowpass";
        warmth.frequency.value = 850;
        warmth.Q.value = 0.5;
        warmth.connect(master);
        master.connect(limiter);
        limiter.connect(context.destination);

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

        const graph: AmbientGraph = {
          context,
          master,
          oscillators,
          shimmerTimerId: 0,
          shimmers,
        };
        const scheduleShimmer = () => {
          graph.shimmerTimerId = window.setTimeout(
            () => {
              if (
                graphRef.current !== graph ||
                context.state !== "running"
              ) {
                return;
              }

              const shimmer = context.createOscillator();
              const shimmerGain = context.createGain();
              const frequencies = [659.25, 783.99, 987.77, 1046.5];
              shimmer.frequency.value =
                frequencies[Math.floor(Math.random() * frequencies.length)];
              shimmer.detune.value = (Math.random() - 0.5) * 8;
              shimmer.type = "sine";
              const now = context.currentTime;
              shimmerGain.gain.setValueAtTime(0.0001, now);
              shimmerGain.gain.exponentialRampToValueAtTime(
                0.018 + Math.random() * 0.008,
                now + 0.1,
              );
              shimmerGain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 2.4,
              );
              shimmer.connect(shimmerGain);
              shimmerGain.connect(master);
              const shimmerNodes = {
                gain: shimmerGain,
                oscillator: shimmer,
              };
              shimmers.add(shimmerNodes);
              shimmer.addEventListener(
                "ended",
                () => {
                  shimmer.disconnect();
                  shimmerGain.disconnect();
                  shimmers.delete(shimmerNodes);
                },
                { once: true },
              );
              shimmer.start(now);
              shimmer.stop(now + 2.5);
              scheduleShimmer();
            },
            5200 + Math.random() * 3800,
          );
        };

        graphRef.current = graph;
        pendingContext = null;
        scheduleShimmer();
        return true;
      } catch {
        if (pendingContext && pendingContext.state !== "closed") {
          void pendingContext.close();
        }
        return false;
      }
    })();

    startingRef.current = pendingStart;
    try {
      return await pendingStart;
    } finally {
      if (startingRef.current === pendingStart) startingRef.current = null;
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
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Audio still works for this visit when storage is restricted.
      }
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
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Volume still changes for this visit when storage is restricted.
      }
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
