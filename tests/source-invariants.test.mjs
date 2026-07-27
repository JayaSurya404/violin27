import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("keeps microphone analysis calibrated and privacy bounded", async () => {
  const [hook, cake] = await Promise.all([
    source("src/hooks/useBlowDetection.ts"),
    source("src/sections/CakeCeremony.tsx"),
  ]);
  const fftConfiguration = hook.indexOf("analyser.fftSize = 512");
  const sampleAllocation = hook.indexOf(
    "new Uint8Array(analyser.fftSize)",
  );

  assert.ok(fftConfiguration >= 0);
  assert.ok(sampleAllocation > fftConfiguration);
  assert.match(hook, /if \(!active\) return/);
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /stream\.getTracks\(\)\.forEach/);
  assert.match(hook, /noiseFloorRef/);
  assert.match(hook, /setGusting\(true\)/);
  assert.match(hook, /remainingRef\.current = 0/);
  assert.doesNotMatch(hook, /remainingRef\.current\s*-=/);
  assert.match(cake, /const lit = remaining > 0/);
  assert.match(cake, /is-afterglow/);
  assert.match(cake, /setCelebrating\(true\)/);
});

test("preserves touch, milestone, and modal accessibility behavior", async () => {
  const [experience, tree, blessing, music, wishSky, typewriter] =
    await Promise.all([
      source("src/components/BirthdayExperience.tsx"),
      source("src/sections/WishTree.tsx"),
      source("src/components/MoonBlessing.tsx"),
      source("src/components/MusicDock.tsx"),
      source("src/sections/WishSky.tsx"),
      source("src/components/TypewriterSequence.tsx"),
    ]);

  assert.match(tree, /<motion\.button/);
  assert.match(tree, /dragSnapToOrigin/);
  assert.match(experience, /\[unlocked, setUnlocked\] = useState\(false\)/);
  assert.doesNotMatch(experience, /trackExploration\("birthday-reveal"\)/);
  assert.match(experience, /cakeComplete/);
  assert.match(blessing, /event\.key === "Escape"/);
  assert.match(blessing, /element\.inert = true/);
  assert.match(music, /aria-label=.*volume controls/);
  assert.match(wishSky, /event\.key === "Escape"/);
  assert.match(wishSky, /closeButtonRef\.current\?\.focus/);
  assert.match(typewriter, /aria-atomic="true"/);
  assert.match(typewriter, /aria-hidden="true"/);
});

test("reserves mobile reading space and prevents horizontal clipping", async () => {
  const styles = await source("app/globals.css");

  assert.match(
    styles,
    /\.letter-scene\.is-open \.letter-paper\s*\{[^}]*position:\s*relative/s,
  );
  assert.match(styles, /html:has\(\.arrival:not\(\.is-unlocking\)\)/);
  assert.match(styles, /overflow-x:\s*clip/);
});
