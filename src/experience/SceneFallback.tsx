"use client";

import type { CSSProperties } from "react";

import styles from "./AuroraWorld.module.css";

export interface SceneFallbackProps {
  celebration: boolean;
  progress: number;
  reducedMotion: boolean;
  unlocked: boolean;
}

type FallbackStyle = CSSProperties & {
  "--aurora-intensity": string;
  "--aurora-warmth": string;
  "--star-intensity": string;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function SceneFallback({
  celebration,
  progress,
  reducedMotion,
  unlocked,
}: SceneFallbackProps) {
  const normalizedProgress = clamp01(progress);
  const style: FallbackStyle = {
    "--aurora-intensity": String(
      0.2 + (unlocked ? 0.34 : 0) + normalizedProgress * 0.18 + (celebration ? 0.16 : 0),
    ),
    "--aurora-warmth": String(normalizedProgress * 0.6 + (celebration ? 0.4 : 0)),
    "--star-intensity": String(0.32 + (unlocked ? 0.34 : 0) + normalizedProgress * 0.16),
  };

  return (
    <div
      aria-hidden="true"
      className={styles.fallback}
      data-celebration={celebration ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      style={style}
    >
      <div className={`${styles.starField} ${styles.starFieldFar}`} />
      <div className={`${styles.starField} ${styles.starFieldNear}`} />
      <div className={`${styles.fallbackAurora} ${styles.fallbackAuroraOne}`} />
      <div className={`${styles.fallbackAurora} ${styles.fallbackAuroraTwo}`} />
      <div className={styles.fallbackHaze} />
      <div className={styles.fallbackMoon}>
        <span className={styles.fallbackMoonGlow} />
      </div>
    </div>
  );
}
