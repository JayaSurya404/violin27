"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { site } from "@/config/site";
import { chime } from "@/lib/sound";

export function Letter() {
  const ref = useRef<HTMLElement>(null); const inView = useInView(ref, { once: true, amount: .35 }); const [opened, setOpened] = useState(false);
  const open = () => { setOpened(true); navigator.vibrate?.(8); chime(318, .55); };
  return <section ref={ref} className="story-section letter-section" aria-labelledby="letter-title"><div className="chapter-mark">05 / what I never said properly</div><h2 id="letter-title">A letter, at last.</h2><div className={`envelope-wrap ${opened ? "is-open" : ""}`}>
    <motion.button className="envelope" onClick={open} aria-expanded={opened} aria-label="Open the letter" initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.1 }}><span className="wax">Y</span><span className="envelope-flap"/></motion.button>
    {opened && <motion.article className="letter-paper" initial={{ opacity: 0, y: 35, rotateX: -12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.1, ease: "easeOut" }}><div className="paper-glow"/>{site.letter.map((paragraph, index) => <p key={index} className={index === 0 || index === site.letter.length - 1 ? "handwriting" : ""}>{paragraph}</p>)}</motion.article>}
  </div>{!opened && <p className="open-note">{site.letterPrompt}</p>}</section>;
}
