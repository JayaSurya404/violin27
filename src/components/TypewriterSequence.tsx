"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type TypewriterSequenceProps = {
  lines: readonly string[];
  active: boolean;
  onComplete?: () => void;
};

export function TypewriterSequence({
  lines,
  active,
  onComplete,
}: TypewriterSequenceProps) {
  const reduceMotion = useReducedMotion();
  const [lineIndex, setLineIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    if (!active || lines.length === 0) return;

    if (reduceMotion) {
      const delay = window.setTimeout(() => {
        if (lineIndex === lines.length - 1) {
          onComplete?.();
        } else {
          setLineIndex((current) => current + 1);
        }
      }, 1050);
      return () => window.clearTimeout(delay);
    }

    const currentLine = lines[lineIndex];
    if (visibleText.length < currentLine.length) {
      const delay = window.setTimeout(() => {
        setVisibleText(currentLine.slice(0, visibleText.length + 1));
      }, Math.max(24, 46 - currentLine.length / 4));
      return () => window.clearTimeout(delay);
    }

    const pause = window.setTimeout(() => {
      if (lineIndex === lines.length - 1) {
        onComplete?.();
      } else {
        setVisibleText("");
        setLineIndex((current) => current + 1);
      }
    }, lineIndex === lines.length - 1 ? 900 : 1150);
    return () => window.clearTimeout(pause);
  }, [
    active,
    lineIndex,
    lines,
    onComplete,
    reduceMotion,
    visibleText,
  ]);

  if (!active) return null;

  const displayText = reduceMotion ? lines[lineIndex] : visibleText;

  return (
    <div className="typewriter" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={lineIndex}
          initial={reduceMotion ? false : { opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(5px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {displayText}
          <span className="typewriter__cursor" aria-hidden="true" />
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
