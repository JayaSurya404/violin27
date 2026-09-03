"use client";
import { Pause, Play, Volume2 } from "lucide-react";
import { useState } from "react";
import { chime } from "@/lib/sound";
import { site } from "@/config/site";

export function MusicMoment({ onPlay }: { onPlay: () => void }) {
  const [playing, setPlaying] = useState(false);
  const toggle = () => { const next = !playing; setPlaying(next); if (next) { chime(248, 1.25); onPlay(); } };
  return <section className="story-section music-section" aria-labelledby="music-title"><div className="chapter-mark">03 / a memory in sound</div><h2 id="music-title">{site.quotes.music}<br/><em>{site.quotes.musicEmphasis}</em></h2><div className={`music-card ${playing ? "is-playing" : ""}`}><div className="vinyl" aria-hidden="true"><i/></div><div className="track-info"><span>{site.music.title}</span><small>{site.music.artist}</small></div><button onClick={toggle} aria-label={playing ? "Pause ambient moment" : "Play ambient moment"}>{playing ? <Pause size={18}/> : <Play size={18} fill="currentColor"/>}</button></div><p className="audio-note"><Volume2 size={14}/> Optional sound. Nothing plays until you choose.</p></section>;
}
