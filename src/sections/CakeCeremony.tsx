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
  onComplete: () => void;
};

export function CakeCeremony({
  content,
  onComplete,
}: CakeCeremonyProps) {
  const reduceMotion = useReducedMotion();
  const didCompleteRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  const handleCandleOut = useCallback(() => {
    navigator.vibrate?.(10);
  }, []);

  const handleComplete = useCallback(() => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    playCelebration();
    navigator.vibrate?.([24, 45, 32]);
    onComplete();
  }, [onComplete]);

  const {
    dismissMicrophoneNotice,
    status,
    intensity,
    pauseMicrophone,
    remaining,
    requestMicrophone,
  } = useBlowDetection({
    active: isInViewport,
    candleCount: CANDLE_COUNT,
    onCandleOut: handleCandleOut,
    onComplete: handleComplete,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) pauseMicrophone();
      setIsInViewport(entry.isIntersecting);
    });

    observer.observe(section);
    return () => observer.disconnect();
  }, [pauseMicrophone]);

  const complete = status === "complete";
  const needsExplanation = status === "denied" || status === "unavailable";

  return (
    <section
      ref={sectionRef}
      className={`chapter cake-chapter ${complete ? "is-complete" : ""}`}
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

          <div
            className="birthday-cake"
            aria-label={`${remaining} of ${CANDLE_COUNT} candles are still lit`}
          >
            <div className="candles" aria-hidden="true">
              {Array.from({ length: CANDLE_COUNT }, (_, index) => {
                const lit = index < remaining;
                return (
                  <span
                    className={`candle ${lit ? "is-lit" : "is-out"}`}
                    key={index}
                  >
                    <i className="flame" />
                    <i className="smoke" />
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

            {complete ? (
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
          >
            <Mic size={20} aria-hidden="true" />
            <div>
              <h3 id="microphone-explanation-title">
                {status === "denied"
                  ? content.deniedTitle
                  : content.unavailableTitle}
              </h3>
              <p>
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
