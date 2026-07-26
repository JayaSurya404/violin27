"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { TypewriterSequence } from "@/src/components/TypewriterSequence";

type HeroChapterProps = {
  active: boolean;
  lines: readonly string[];
  reveal: {
    kicker: string;
    title: string;
    name: string;
    subtitle: string;
  };
  onReveal: () => void;
};

export function HeroChapter({
  active,
  lines,
  reveal,
  onReveal,
}: HeroChapterProps) {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  const completeSequence = () => {
    setRevealed(true);
    onReveal();
  };

  return (
    <section className="chapter hero-chapter" aria-labelledby="birthday-title">
      <div className="hero-chapter__petals" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <i key={index} style={{ "--petal-index": index } as React.CSSProperties} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="intro"
            className="hero-chapter__intro"
            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.8 }}
          >
            <TypewriterSequence
              lines={lines}
              active={active}
              onComplete={completeSequence}
            />
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            className="hero-reveal"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 32, filter: "blur(14px)", scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="hero-reveal__ornament"
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 120 }}
            >
              <Sparkles size={17} aria-hidden="true" />
            </motion.div>
            <span className="eyebrow">{reveal.kicker}</span>
            <h1 id="birthday-title">
              <span>{reveal.title}</span>
              {reveal.name}
            </h1>
            <p>{reveal.subtitle}</p>
            <motion.div
              className="scroll-cue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.72 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              aria-hidden="true"
            >
              <span>Follow the moonlight</span>
              <ChevronDown size={17} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

