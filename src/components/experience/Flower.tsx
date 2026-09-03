"use client";
import { motion } from "framer-motion";
export function Flower({ bloom = false }: { bloom?: boolean }) {
  return <motion.div className={`flower ${bloom ? "flower--bloom" : ""}`} aria-hidden="true" animate={bloom ? { scale: [1, 1.05, 1], filter: ["drop-shadow(0 0 10px #8b5cf6)", "drop-shadow(0 0 24px #c4b5fd)", "drop-shadow(0 0 10px #8b5cf6)"] } : {}} transition={{ duration: 3, repeat: Infinity }}>
    <i className="stem"/>{[0, 45, 90, 135, 180, 225, 270, 315].map((rotation) => <i key={rotation} className="petal" style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}/>) }<i className="flower-core"/>
  </motion.div>;
}
