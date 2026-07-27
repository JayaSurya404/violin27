"use client";

import Lenis from "lenis";
import { useEffect } from "react";

const WISH_DRAG_EVENT = "purple-aurora:wish-drag";

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

    const handleWishDrag = (event: Event) => {
      const active = (event as CustomEvent<{ active?: boolean }>).detail
        ?.active;
      if (active) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    window.addEventListener(WISH_DRAG_EVENT, handleWishDrag);
    frameId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener(WISH_DRAG_EVENT, handleWishDrag);
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [disabled]);
}
