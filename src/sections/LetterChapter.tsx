"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MailOpen, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { SectionHeading } from "@/src/components/SectionHeading";
import type { LetterContent } from "@/src/types/site";
import { playPaper } from "@/src/lib/audio";

type LetterChapterProps = {
  letter: LetterContent;
  onOpen: () => void;
};

export function LetterChapter({ letter, onOpen }: LetterChapterProps) {
  const reduceMotion = useReducedMotion();
  const [opened, setOpened] = useState(false);
  const didReportRef = useRef(false);

  const openLetter = () => {
    setOpened(true);
    playPaper();
    navigator.vibrate?.(14);
    if (!didReportRef.current) {
      didReportRef.current = true;
      onOpen();
    }
  };

  return (
    <section className="chapter letter-chapter">
      <div className="chapter-shell chapter-shell--narrow">
        <SectionHeading
          eyebrow="A note, folded with care"
          title={letter.title}
          body={letter.openPrompt}
        />

        <motion.div
          className={`letter-scene ${opened ? "is-open" : ""}`}
          initial={reduceMotion ? false : { opacity: 0, y: -80, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            className="envelope"
            onClick={openLetter}
            aria-expanded={opened}
            aria-controls="birthday-letter"
            aria-label={opened ? "Birthday letter opened" : "Open birthday letter"}
          >
            <span className="envelope__back" aria-hidden="true" />
            <span className="envelope__paper-peek" aria-hidden="true">
              <Sparkles size={16} />
            </span>
            <span className="envelope__front" aria-hidden="true" />
            <span className="envelope__flap" aria-hidden="true" />
            <span className="envelope__seal" aria-hidden="true">Y</span>
            {!opened ? (
              <span className="envelope__instruction">
                <MailOpen size={15} aria-hidden="true" />
                {letter.openPrompt}
              </span>
            ) : null}
          </button>

          <motion.article
            id="birthday-letter"
            className="letter-paper"
            aria-hidden={!opened}
            initial={false}
            animate={
              opened
                ? { opacity: 1, y: 0, rotateX: 0, scale: 1 }
                : { opacity: 0, y: 120, rotateX: 12, scale: 0.92 }
            }
            transition={{
              duration: reduceMotion ? 0.2 : 1.05,
              ease: [0.16, 1, 0.3, 1],
              delay: reduceMotion ? 0 : 0.18,
            }}
          >
            <span className="letter-paper__overline">27 · 07</span>
            <h3>{letter.title}</h3>
            <p className="letter-paper__salutation">{letter.salutation}</p>
            {letter.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>{letter.closing}</p>
            <span className="letter-paper__signature">{letter.signature}</span>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
