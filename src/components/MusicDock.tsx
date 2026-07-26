"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Music2, Pause, Play, Volume1, VolumeX } from "lucide-react";
import { useState } from "react";
import { useAmbientAudio } from "@/src/hooks/useAmbientAudio";
import type { InterfaceCopy } from "@/src/types/site";

type MusicDockProps = {
  labels: InterfaceCopy["music"];
  title: string;
  visible: boolean;
};

export function MusicDock({ labels, title, visible }: MusicDockProps) {
  const { enabled, volume, ready, setEnabled, setVolume } = useAmbientAudio();
  const [expanded, setExpanded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const toggle = async () => {
    setUnavailable(false);
    const changed = await setEnabled(!enabled);
    if (!changed) setUnavailable(true);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          className={`music-dock glass ${expanded ? "is-expanded" : ""}`}
          initial={{ opacity: 0, y: 18, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          aria-label="Ambient music controls"
        >
          <button
            className="icon-button"
            type="button"
            onClick={toggle}
            disabled={!ready}
            aria-label={enabled ? labels.pauseLabel : labels.playLabel}
          >
            {enabled ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button
            className="music-dock__label"
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
          >
            <Music2 size={14} aria-hidden="true" />
            <span>{unavailable ? labels.unavailable : title}</span>
          </button>
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                className="music-dock__volume"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 92, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
              >
                {volume === 0 ? (
                  <VolumeX size={15} aria-hidden="true" />
                ) : (
                  <Volume1 size={15} aria-hidden="true" />
                )}
                <input
                  aria-label={labels.volumeLabel}
                  type="range"
                  min="0"
                  max="0.7"
                  step="0.05"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
