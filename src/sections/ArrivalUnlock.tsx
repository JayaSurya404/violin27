"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { Fingerprint, Sparkles } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { playChime, playPulse } from "@/src/lib/audio";

type ArrivalUnlockProps = {
  blackoutMs: number;
  holdDurationMs: number;
  instruction: string;
  shortTapHint: string;
  onUnlock: () => void;
};

export function ArrivalUnlock({
  blackoutMs,
  holdDurationMs,
  instruction,
  shortTapHint,
  onUnlock,
}: ArrivalUnlockProps) {
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const startedAtRef = useRef(0);
  const frameRef = useRef(0);
  const didCompleteRef = useRef(false);
  const didHalfPulseRef = useRef(false);
  const hintTimerRef = useRef(0);
  const unlockTimerRef = useRef(0);
  const lightRef = useRef<HTMLDivElement>(null);
  const quietRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const complete = useCallback(() => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    setProgress(1);
    setHolding(false);
    setUnlocked(true);
    navigator.vibrate?.([35, 40, 65]);
    playChime();
    if (!reduceMotion) {
      timelineRef.current = gsap
        .timeline()
        .to(lightRef.current, {
          duration: 1.35,
          ease: "power4.out",
          opacity: 1,
          scale: 5.8,
        })
        .to(
          quietRef.current,
          {
            duration: 1.1,
            ease: "power2.in",
            filter: "blur(2px)",
            opacity: 1,
            scale: 1.35,
          },
          0,
        );
    }
    unlockTimerRef.current = window.setTimeout(
      onUnlock,
      reduceMotion ? 250 : 1380,
    );
  }, [onUnlock, reduceMotion]);

  const beginHold = useCallback(() => {
    if (didCompleteRef.current || holding) return;
    window.clearTimeout(hintTimerRef.current);
    setShowHint(false);
    setHolding(true);
    didHalfPulseRef.current = false;
    playPulse();
    startedAtRef.current = performance.now();
    const animateHold = (time: number) => {
      const elapsed = time - startedAtRef.current;
      const nextProgress = Math.min(1, elapsed / holdDurationMs);
      setProgress(nextProgress);
      if (nextProgress >= 0.52 && !didHalfPulseRef.current) {
        didHalfPulseRef.current = true;
        navigator.vibrate?.(9);
      }

      if (nextProgress >= 1) {
        complete();
        return;
      }
      frameRef.current = requestAnimationFrame(animateHold);
    };
    frameRef.current = requestAnimationFrame(animateHold);
  }, [complete, holdDurationMs, holding]);

  const cancelHold = useCallback(() => {
    if (!holding || didCompleteRef.current) return;
    cancelAnimationFrame(frameRef.current);
    setHolding(false);
    setProgress(0);
    didHalfPulseRef.current = false;
    setShowHint(true);
    navigator.vibrate?.(18);
    hintTimerRef.current = window.setTimeout(() => setShowHint(false), 1600);
  }, [holding]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    beginHold();
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cancelHold();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      beginHold();
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      cancelHold();
    }
  };

  useEffect(
    () => {
      const cancelOnInterruption = () => cancelHold();
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") cancelHold();
      };

      window.addEventListener("blur", cancelOnInterruption);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        window.removeEventListener("blur", cancelOnInterruption);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    },
    [cancelHold],
  );

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(hintTimerRef.current);
      window.clearTimeout(unlockTimerRef.current);
      timelineRef.current?.kill();
    },
    [],
  );

  return (
    <motion.div
      className={`arrival ${unlocked ? "is-unlocking" : ""}`}
      initial={{ opacity: 1 }}
      animate={unlocked ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.2 : 1.35, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={unlocked}
      style={
        {
          "--arrival-delay": `${blackoutMs}ms`,
        } as CSSProperties
      }
    >
      <div ref={quietRef} className="arrival__quiet" aria-hidden="true" />
      <div className="arrival__copy">
        <motion.span
          className="arrival__kicker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.72, y: 0 }}
          transition={{ delay: (blackoutMs + 450) / 1000, duration: 1.2 }}
        >
          A little something is waiting
        </motion.span>
      </div>

      <div className="unlock">
        <AnimatePresence>
          {showHint ? (
            <motion.div
              className="unlock__hint glass"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5 }}
              role="status"
            >
              <Sparkles size={13} aria-hidden="true" />
              {shortTapHint}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          className={`fingerprint ${holding ? "is-holding" : ""} ${
            showHint ? "is-short-tap" : ""
          }`}
          type="button"
          aria-label={instruction}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={cancelHold}
          onLostPointerCapture={cancelHold}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          style={
            {
              "--hold-progress": `${progress * 360}deg`,
              "--hold-progress-ratio": progress,
            } as React.CSSProperties
          }
        >
          <span className="fingerprint__ring" aria-hidden="true" />
          <span className="fingerprint__core" aria-hidden="true">
            <Fingerprint size={43} strokeWidth={1.25} />
          </span>
          <span className="fingerprint__particles" aria-hidden="true" />
        </button>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.74, y: 0 }}
          transition={{ delay: (blackoutMs + 700) / 1000, duration: 1 }}
        >
          {instruction}
        </motion.p>
      </div>

      <div
        ref={lightRef}
        className="arrival__light-spread"
        aria-hidden="true"
      />
    </motion.div>
  );
}
