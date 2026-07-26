"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function useLenis(disabled: boolean) {
  useEffect(() => {
    if (disabled) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1,
      wheelMultiplier: 0.82,
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

