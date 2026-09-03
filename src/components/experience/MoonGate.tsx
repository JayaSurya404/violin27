"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { chime } from "@/lib/sound";
import { site } from "@/config/site";

export function MoonGate({ onBegin }: { onBegin: () => void }) {
  const clicked = useRef(false);
  const begin = () => { if (clicked.current) return; clicked.current = true; navigator.vibrate?.(12); chime(196, .7); onBegin(); };
  return <section className="moon-gate" aria-label="Beginning of the letter">
    <div className="opening-copy" aria-live="polite">
      {site.opening.map((line, index) => <motion.p key={line} initial={{ opacity: 0, filter: "blur(8px)", y: 8 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ delay: .4 + index * 1.25, duration: 1.2 }}>{line}</motion.p>)}
    </div>
    <motion.button className="moon-button" onClick={begin} aria-label="Touch the moon to begin" whileTap={{ scale: .94 }}>
      <span className="moon-core"/><span className="moon-ring"/><span className="touch-label">touch the moon</span>
    </motion.button>
    <span className="scroll-hint">or take your time</span>
  </section>;
}
