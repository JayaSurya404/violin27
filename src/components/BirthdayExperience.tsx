"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MoonStar, WifiOff } from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { siteConfig } from "@/src/config/site";
import { useLenis } from "@/src/hooks/useLenis";
import { playChime } from "@/src/lib/audio";
import { MoonBlessing } from "@/src/components/MoonBlessing";
import { MusicDock } from "@/src/components/MusicDock";
import { ArrivalUnlock } from "@/src/sections/ArrivalUnlock";
import { CakeCeremony } from "@/src/sections/CakeCeremony";
import { Ending } from "@/src/sections/Ending";
import { HeroChapter } from "@/src/sections/HeroChapter";
import { LetterChapter } from "@/src/sections/LetterChapter";
import { StoryChapter } from "@/src/sections/StoryChapter";
import { WishSky } from "@/src/sections/WishSky";
import { WishTree } from "@/src/sections/WishTree";

const AuroraWorld = dynamic(
  () =>
    import("@/src/experience/AuroraWorld").then(
      (module) => module.AuroraWorld,
    ),
  {
    ssr: false,
    loading: () => <div className="world-loading" aria-hidden="true" />,
  },
);

const PROGRESS_STORAGE_KEY = "purple-aurora:completed-moments";

type ThemeStyle = CSSProperties & {
  "--midnight": string;
  "--deep-purple": string;
  "--royal-violet": string;
  "--lavender": string;
  "--soft-white": string;
  "--silver": string;
  "--moon-glow": string;
  "--aurora-blue": string;
  "--aurora-pink": string;
};

export function BirthdayExperience() {
  const reduceMotion = useReducedMotion();
  const mainRef = useRef<HTMLElement>(null);
  const moonNoteTimerRef = useRef(0);
  const [unlocked, setUnlocked] = useState(false);
  const [birthdayRevealed, setBirthdayRevealed] = useState(false);
  const [cakeComplete, setCakeComplete] = useState(false);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [explorations, setExplorations] = useState<Set<string>>(
    () => new Set(),
  );
  const [moonBlessingOpen, setMoonBlessingOpen] = useState(false);
  const [moonNote, setMoonNote] = useState("");
  const [online, setOnline] = useState(true);

  useLenis(!unlocked || Boolean(reduceMotion));

  const themeStyle = useMemo<ThemeStyle>(() => {
    const colors = siteConfig.theme.colors;
    return {
      "--midnight": colors.midnightBlack,
      "--deep-purple": colors.deepPurple,
      "--royal-violet": colors.royalViolet,
      "--lavender": colors.lavender,
      "--soft-white": colors.softWhite,
      "--silver": colors.silver,
      "--moon-glow": colors.moonGlow,
      "--aurora-blue": colors.auroraBlue,
      "--aurora-pink": colors.auroraPink,
    };
  }, []);

  const trackExploration = useCallback((id: string) => {
    setExplorations((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      try {
        window.localStorage.setItem(
          PROGRESS_STORAGE_KEY,
          JSON.stringify(Array.from(next)),
        );
      } catch {
        // Progress remains available for this visit when storage is unavailable.
      }
      return next;
    });
  }, []);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    trackExploration("gift-unlocked");
    window.setTimeout(() => mainRef.current?.focus(), 80);
  }, [trackExploration]);

  const handleMoonInteract = useCallback(() => {
    playChime();
    navigator.vibrate?.(12);
    const isNewInteraction = !explorations.has("moon-touched");
    const nextCount = explorations.size + (isNewInteraction ? 1 : 0);
    trackExploration("moon-touched");

    if (nextCount >= siteConfig.experience.moonUnlockInteractions) {
      setMoonBlessingOpen(true);
      setMoonNote("");
      return;
    }

    const messageIndex = Math.min(
      Math.max(0, nextCount - 1),
      siteConfig.moon.touchMessages.length - 1,
    );
    setMoonNote(siteConfig.moon.touchMessages[messageIndex]);
    window.clearTimeout(moonNoteTimerRef.current);
    moonNoteTimerRef.current = window.setTimeout(() => setMoonNote(""), 2600);
  }, [explorations, trackExploration]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(
          window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "[]",
        ) as unknown;
        if (
          Array.isArray(saved) &&
          saved.every((item): item is string => typeof item === "string")
        ) {
          setExplorations(new Set(saved));
        }
      } catch {
        // A fresh journey is safer than failing on malformed local storage.
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    let frameId = 0;
    const updateProgress = () => {
      frameId = 0;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setJourneyProgress(
        documentHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / documentHeight))
          : 0,
      );
    };
    const handleScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, [unlocked]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setOnline(navigator.onLine);
    });
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(moonNoteTimerRef.current);
    },
    [],
  );

  const moonReady =
    explorations.size >= siteConfig.experience.moonUnlockInteractions;
  const celebration = birthdayRevealed || cakeComplete;
  const storyBeats = siteConfig.story.paragraphs.map((text, index) => ({
    id: `story-${index + 1}`,
    text,
  }));

  return (
    <div
      className={`experience ${unlocked ? "is-unlocked" : ""}`}
      style={themeStyle}
    >
      {unlocked ? (
        <a className="skip-link" href="#experience-main">
          Skip to the birthday story
        </a>
      ) : null}

      <AuroraWorld
        celebration={celebration}
        moonLabel={siteConfig.moon.accessibleLabel}
        onMoonInteract={handleMoonInteract}
        palette={siteConfig.theme.colors}
        progress={journeyProgress}
        unlocked={unlocked}
      />
      <div className="experience__veil" aria-hidden="true" />

      {!unlocked ? (
        <ArrivalUnlock
          holdDurationMs={siteConfig.experience.holdDurationMs}
          instruction={siteConfig.arrival.instruction}
          shortTapHint={siteConfig.arrival.shortTapHint}
          onUnlock={handleUnlock}
        />
      ) : null}

      <main
        id="experience-main"
        ref={mainRef}
        tabIndex={-1}
        aria-hidden={!unlocked}
        inert={unlocked ? undefined : true}
      >
        <HeroChapter
          active={unlocked}
          lines={siteConfig.openingLines}
          reveal={siteConfig.birthdayReveal}
          onReveal={() => {
            setBirthdayRevealed(true);
            trackExploration("birthday-reveal");
          }}
        />
        <WishSky
          copy={siteConfig.wishSky}
          wishes={siteConfig.wishStars}
          onDiscover={(id) => trackExploration(`wish-star:${id}`)}
        />
        <StoryChapter
          eyebrow={siteConfig.story.eyebrow}
          title={siteConfig.story.title}
          beats={storyBeats}
          closing={siteConfig.story.closing}
        />
        <LetterChapter
          letter={siteConfig.letter}
          onOpen={() => trackExploration("letter-opened")}
        />
        <CakeCeremony
          content={siteConfig.cake}
          onComplete={() => {
            setCakeComplete(true);
            trackExploration("cake-complete");
          }}
        />
        <WishTree
          copy={siteConfig.wishTree}
          wishes={siteConfig.treeWishes}
          onPlace={(id) => trackExploration(`tree-wish:${id}`)}
        />
        <Ending
          eyebrow={siteConfig.ending.eyebrow}
          title={siteConfig.ending.title}
          lines={siteConfig.ending.lines}
          signature={siteConfig.ending.signature}
          finalLine={siteConfig.ending.finalLine}
        />
      </main>

      <MusicDock
        labels={siteConfig.interface.music}
        title={siteConfig.music.track.title}
        visible={unlocked && siteConfig.features.music}
      />

      <AnimatePresence>
        {unlocked && (moonNote || moonReady) && !moonBlessingOpen ? (
          <motion.div
            className="moon-ready-note glass"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
          >
            <MoonStar size={14} aria-hidden="true" />
            {moonNote || siteConfig.moon.hint}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!online && unlocked ? (
          <motion.div
            className="offline-note glass"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            role="status"
          >
            <WifiOff size={15} aria-hidden="true" />
            <span>{siteConfig.interface.errors.offlineMessage}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <MoonBlessing
        open={moonBlessingOpen}
        title={siteConfig.moon.blessingTitle}
        message={siteConfig.moon.blessing}
        onClose={() => setMoonBlessingOpen(false)}
      />
    </div>
  );
}
