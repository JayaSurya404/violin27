"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MoonStar, Sparkles } from "lucide-react";

type EndingProps = {
  eyebrow: string;
  title: string;
  lines: readonly string[];
  signature: string;
  finalLine: string;
};

export function Ending({
  eyebrow,
  title,
  lines,
  signature,
  finalLine,
}: EndingProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="chapter ending">
      <div className="ending__light" aria-hidden="true" />
      <motion.div
        className="ending__content"
        initial={reduceMotion ? false : { opacity: 0, y: 30, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <MoonStar className="ending__moon" size={26} aria-hidden="true" />
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <div className="ending__rule" aria-hidden="true">
          <i />
          <Sparkles size={14} />
          <i />
        </div>
        <span className="ending__signature">{signature}</span>
        <p className="ending__final-line">{finalLine}</p>
      </motion.div>
    </section>
  );
}
