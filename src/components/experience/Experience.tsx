"use client";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { Atmosphere } from "./Atmosphere";
import { MoonGate } from "./MoonGate";
import { Letter } from "./Letter";
import { Flower } from "./Flower";
import { useReducedMotionPreference } from "@/hooks/useReducedMotion";

function Chapter({ chapter }: { chapter: (typeof site.chapters)[number] }) {
  return <motion.section className="story-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .38 }} transition={{ duration: 1, ease: "easeOut" }}><div className="chapter-mark">{chapter.number} / {chapter.eyebrow}</div><h2>{chapter.title}</h2><p>{chapter.body}</p></motion.section>;
}

export function Experience() {
  const [begun, setBegun] = useState(false); const [revealed, setRevealed] = useState(false); const reduced = useReducedMotionPreference();
  const { scrollYProgress } = useScroll(); const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: .001 });
  useEffect(() => { const reveal = () => { if (window.scrollY > document.body.scrollHeight * .59) setRevealed(true); }; window.addEventListener("scroll", reveal, { passive: true }); return () => window.removeEventListener("scroll", reveal); }, []);
  return <main className={`experience ${begun ? "has-begun" : ""}`}><Atmosphere warm={revealed}/><motion.div className="progress" style={{ scaleX: progress }}/><a className="skip-link" href="#story">Skip introduction</a>
    <AnimatePresence>{!begun && <motion.div className="opening-layer" exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 1.4 }}><MoonGate onBegin={() => setBegun(true)}/></motion.div>}</AnimatePresence>
    <div id="story" className="story" aria-hidden={!begun}>
      <section className="story-section threshold"><div className="chapter-mark">01 / before I say it</div><Flower/><h1>For <span>{site.person}</span></h1><p>{site.intro}</p><div className="down-line"/></section>
      {site.chapters.map((chapter) => <Chapter key={chapter.number} chapter={chapter}/>)}
      <Letter/>
      <section className="love-reveal" aria-labelledby="love-title"><Flower bloom/><motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .45 }} transition={{ duration: 1.6 }}>{site.loveMessage.lead}</motion.p><motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .5 }} transition={{ delay: reduced ? 0 : 1.4, duration: 1.6 }}>{site.loveMessage.simple}</motion.p><motion.h2 id="love-title" initial={{ opacity: 0, filter: "blur(12px)" }} whileInView={{ opacity: 1, filter: "blur(0px)" }} viewport={{ once: true, amount: .5 }} transition={{ delay: reduced ? .1 : 3.3, duration: 2.2 }}>{site.loveMessage.reveal}</motion.h2></section>
      <section className="story-section no-pressure"><div className="chapter-mark">08 / no answer required</div><h2>{site.noPressure[0]}</h2><p>{site.noPressure[1]}</p></section>
      <section className="wishes" aria-labelledby="wish-title"><div className="chapter-mark">09 / one wish for you</div><h2 id="wish-title">More than anything, I hope…</h2><ul>{site.wishes.map((wish, index) => <motion.li key={wish} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .16, duration: .7 }}>{wish}</motion.li>)}</ul></section>
      <footer className="ending"><Flower bloom/><p>{site.final.first}</p><p>{site.final.second}</p><h2>I love you, <em>{site.person.split(" ")[0]}.</em></h2><div className="signature">{site.final.signature}<strong>{site.creator}</strong></div><small>That’s all I wanted to say.</small></footer>
    </div>
  </main>;
}
