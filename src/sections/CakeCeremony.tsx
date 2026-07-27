"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mic, RotateCcw, Sparkles, Wind } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/src/components/SectionHeading";
import { useBlowDetection } from "@/src/hooks/useBlowDetection";
import { playCelebration } from "@/src/lib/audio";
import type { CakeContent } from "@/src/types/site";

const CANDLE_COUNT = 5;

type CakeCeremonyProps = {
  content: CakeContent;
  onExtinguish: () => void;
  onComplete: () => void;
};

export function CakeCeremony({
  content,
  onExtinguish,
  onComplete,
}: CakeCeremonyProps) {
  const reduceMotion = useReducedMotion();
  const didExtinguishRef = useRef(false);
  const celebrationTimerRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const handleCandleOut = useCallback((remainingCandles: number) => {
    if (remainingCandles === 0) navigator.vibrate?.(18);
  }, []);

  const handleExtinguish = useCallback(() => {
    if (didExtinguishRef.current) return;
    didExtinguishRef.current = true;
    onExtinguish();
    navigator.vibrate?.([18, 34, 22]);

    celebrationTimerRef.current = window.setTimeout(
      () => {
        setCelebrating(true);
        playCelebration();
        navigator.vibrate?.([24, 45, 32]);
        onComplete();
      },
      reduceMotion ? 320 : 1750,
    );
  }, [onComplete, onExtinguish, reduceMotion]);

  const {
    dismissMicrophoneNotice,
    status,
    intensity,
    gusting,
    pauseMicrophone,
    remaining,
    requestMicrophone,
  } = useBlowDetection({
    active: isInViewport,
    candleCount: CANDLE_COUNT,
    onCandleOut: handleCandleOut,
    onComplete: handleExtinguish,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const meaningfullyVisible =
          entry.isIntersecting && entry.intersectionRatio >= 0.18;
        if (!meaningfullyVisible) pauseMicrophone();
        setIsInViewport(meaningfullyVisible);
      },
      {
        rootMargin: "-10% 0px -10%",
        threshold: [0, 0.18],
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [pauseMicrophone]);

  useEffect(
    () => () => window.clearTimeout(celebrationTimerRef.current),
    [],
  );

  const extinguished = status === "complete";
  const needsExplanation = status === "denied" || status === "unavailable";

  useEffect(() => {
    if (!needsExplanation) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusFrame = window.requestAnimationFrame(() =>
      retryButtonRef.current?.focus({ preventScroll: true }),
    );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissMicrophoneNotice();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [dismissMicrophoneNotice, needsExplanation]);

  return (
    <section
      ref={sectionRef}
      className={`chapter cake-chapter ${
        gusting ? "is-gusting" : ""
      } ${extinguished ? "is-afterglow" : ""} ${
        celebrating ? "is-complete" : ""
      }`}
    >
      <div className="chapter-shell chapter-shell--narrow">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          body={`${content.prompt} ${content.subprompt}`}
        />

        <motion.div
          className="cake-scene"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9 }}
          style={{ "--blow-intensity": intensity } as React.CSSProperties}
        >
          <div className="cake-scene__glow" aria-hidden="true" />
          <div className="fireworks" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <i key={index} style={{ "--firework-index": index } as React.CSSProperties} />
            ))}
          </div>
          <div className="cake-petals" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => (
              <i
                key={index}
                style={{ "--cake-petal-index": index } as React.CSSProperties}
              />
            ))}
          </div>

          <div
            className="birthday-cake"
            role="img"
            aria-label={
              remaining === 0
                ? `All ${CANDLE_COUNT} candles are out`
                : `All ${CANDLE_COUNT} candles are lit`
            }
          >
            <div className="candles" aria-hidden="true">
              {Array.from({ length: CANDLE_COUNT }, (_, index) => {
                const lit = remaining > 0;
                return (
                  <span
                    className={`candle ${lit ? "is-lit" : "is-out"}`}
                    key={index}
                    style={{ "--candle-index": index } as React.CSSProperties}
                  >
                    <i className="flame" />
                    <i className="smoke" />
                    <i className="ember" />
                  </span>
                );
              })}
            </div>
            <div className="cake__icing">
              <span />
              <span />
              <span />
            </div>
            <div className="cake__layer cake__layer--top" />
            <div className="cake__layer cake__layer--bottom" />
            <div className="cake__plate" />
          </div>

          <div className="cake-controls">
            {status === "idle" ? (
              <button
                type="button"
                className="primary-button"
                onClick={() => void requestMicrophone()}
              >
                <Mic size={17} aria-hidden="true" />
                {content.allowLabel}
              </button>
            ) : null}

            {status === "requesting" ? (
              <p className="capability-status" role="status">
                <span className="listening-orb" />
                {content.permissionTitle}…
              </p>
            ) : null}

            {status === "listening" ? (
              <div className="blow-meter" role="status" aria-live="polite">
                <Wind size={18} aria-hidden="true" />
                <div>
                  <span>{content.listeningText}</span>
                  <i>
                    <b style={{ transform: `scaleX(${intensity})` }} />
                  </i>
                </div>
              </div>
            ) : null}

            {extinguished && !celebrating ? (
              <span className="sr-only" role="status">
                {content.successTitle}
              </span>
            ) : null}

            {celebrating ? (
              <motion.div
                className="cake-success glass"
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                role="status"
              >
                <Sparkles size={17} aria-hidden="true" />
                <p>{content.successText}</p>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {needsExplanation ? (
          <motion.div
            className="permission-card glass"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            role="dialog"
            aria-labelledby="microphone-explanation-title"
            aria-describedby="microphone-explanation-description"
          >
            <Mic size={20} aria-hidden="true" />
            <div>
              <h3 id="microphone-explanation-title">
                {status === "denied"
                  ? content.deniedTitle
                  : content.unavailableTitle}
              </h3>
              <p id="microphone-explanation-description">
                {status === "denied"
                  ? content.deniedText
                  : content.unavailableText}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                gridColumn: 2,
              }}
            >
              <button
                ref={retryButtonRef}
                type="button"
                className="secondary-button"
                onClick={() => void requestMicrophone()}
              >
                <RotateCcw size={15} aria-hidden="true" />
                {content.retryLabel}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={dismissMicrophoneNotice}
              >
                {content.dismissLabel}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
