"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/src/components/SectionHeading";
import type { StoryBeat } from "@/src/types/site";

type StoryChapterProps = {
  title: string;
  eyebrow: string;
  beats: readonly StoryBeat[];
  closing: string;
};

export function StoryChapter({
  title,
  eyebrow,
  beats,
  closing,
}: StoryChapterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="chapter story-chapter">
      <div className="chapter-shell chapter-shell--narrow">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="story-thread">
          {beats.map((beat, index) => (
            <motion.article
              className="story-beat"
              key={beat.id}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 30, filter: "blur(8px)" }
              }
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{ duration: 0.85, delay: 0.05 }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{beat.text}</p>
            </motion.article>
          ))}
          <motion.article
            className="story-beat story-beat--closing"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
          >
            <span>✦</span>
            <p>{closing}</p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
