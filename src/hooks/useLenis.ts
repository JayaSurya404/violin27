"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function useLenis(disabled: boolean) {
  useEffect(() => {
    if (disabled) return;

    const lenis = new Lenis({
      duration: 1.08,
      easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.04,
      wheelMultiplier: 0.78,
    });
    let frameId = 0;

    const frame = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [disabled]);
}
