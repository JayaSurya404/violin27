"use client";

import { motion, useReducedMotion } from "framer-motion";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      className={`section-heading section-heading--${align}`}
      initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </motion.header>
  );
}

