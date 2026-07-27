"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SectionHeading } from "@/src/components/SectionHeading";
import type { WishSkyCopy, WishStar } from "@/src/types/site";
import { playChime } from "@/src/lib/audio";

type WishSkyProps = {
  copy: WishSkyCopy;
  wishes: readonly WishStar[];
  onDiscover: (id: string) => void;
};

export function WishSky({ copy, wishes, onDiscover }: WishSkyProps) {
  const reduceMotion = useReducedMotion();
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<WishStar | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const points = useMemo(
    () =>
      wishes
        .filter((wish) => opened.has(wish.id))
        .map((wish) => ({ id: wish.id, x: wish.x, y: wish.y })),
    [opened, wishes],
  );

  const selectWish = (wish: WishStar) => {
    setSelected(wish);
    if (!opened.has(wish.id)) {
      setOpened((current) => new Set(current).add(wish.id));
      onDiscover(wish.id);
      playChime();
      navigator.vibrate?.(16);
    }
  };

  useEffect(() => {
    if (!selected) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusFrame = window.requestAnimationFrame(() =>
      closeButtonRef.current?.focus({ preventScroll: true }),
    );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelected(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [selected]);

  return (
    <section className="chapter wish-sky" aria-labelledby="wish-sky-title">
      <div className="chapter-shell">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={`${copy.introduction} ${copy.instruction}`}
        />
        <span id="wish-sky-title" className="sr-only">
          {copy.title}
        </span>

        <motion.div
          className="wish-sky__stage"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 24, scale: 0.99, filter: "blur(7px)" }
          }
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: reduceMotion ? 0.12 : 1.05,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <svg
            className="constellation"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {points.slice(1).map((point, index) => {
              const previous = points[index];
              return (
                <motion.line
                  key={`${previous.id}-${point.id}`}
                  x1={previous.x}
                  y1={previous.y}
                  x2={point.x}
                  y2={point.y}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.72 }}
                  transition={{ duration: reduceMotion ? 0.01 : 1.1 }}
                />
              );
            })}
          </svg>

          {wishes.map((wish, index) => {
            const isOpened = opened.has(wish.id);
            return (
              <span
                key={wish.id}
                className="wish-star-anchor"
                style={{ left: `${wish.x}%`, top: `${wish.y}%` }}
              >
                <motion.button
                  type="button"
                  className={`wish-star ${isOpened ? "is-opened" : ""}`}
                  onClick={() => selectWish(wish)}
                  aria-label={`${isOpened ? "Read again" : "Open"} wish: ${wish.title}`}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: reduceMotion ? 0 : index * 0.08,
                    type: "spring",
                    stiffness: 280,
                    damping: 22,
                    mass: 0.55,
                  }}
                  whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <span className="wish-star__halo" aria-hidden="true" />
                  <Sparkle
                    size={isOpened ? 19 : 15}
                    fill={isOpened ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                </motion.button>
              </span>
            );
          })}

          <div className="wish-sky__progress" aria-live="polite">
                <span>{opened.size}</span>
                <i />
                <span>
                  {opened.size === wishes.length
                    ? copy.completeMessage
                    : `${opened.size} / ${wishes.length} · ${copy.openedLabel}`}
                </span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="wish-note glass"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 18, scale: 0.94, filter: "blur(8px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.96 }
            }
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 190, damping: 23, mass: 0.75 }
            }
            role="dialog"
            aria-label={`Wish: ${selected.title}`}
            aria-describedby={`wish-note-${selected.id}`}
          >
            <button
              ref={closeButtonRef}
              className="modal-close"
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close wish"
            >
              <X size={17} />
            </button>
            <Sparkle className="wish-note__sparkle" size={18} aria-hidden="true" />
            <span>{selected.title}</span>
            <p id={`wish-note-${selected.id}`}>{selected.message}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
