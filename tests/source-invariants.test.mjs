import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("keeps microphone analysis calibrated and privacy bounded", async () => {
  const hook = await source("src/hooks/useBlowDetection.ts");
  const fftConfiguration = hook.indexOf("analyser.fftSize = 512");
  const sampleAllocation = hook.indexOf(
    "new Uint8Array(analyser.fftSize)",
  );

  assert.ok(fftConfiguration >= 0);
  assert.ok(sampleAllocation > fftConfiguration);
  assert.match(hook, /if \(!active\) return/);
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /stream\.getTracks\(\)\.forEach/);
});

test("preserves touch, milestone, and modal accessibility behavior", async () => {
  const [experience, tree, blessing, music] = await Promise.all([
    source("src/components/BirthdayExperience.tsx"),
    source("src/sections/WishTree.tsx"),
    source("src/components/MoonBlessing.tsx"),
    source("src/components/MusicDock.tsx"),
  ]);

  assert.match(tree, /<motion\.button/);
  assert.match(tree, /dragSnapToOrigin/);
  assert.match(experience, /\[unlocked, setUnlocked\] = useState\(false\)/);
  assert.doesNotMatch(experience, /trackExploration\("birthday-reveal"\)/);
  assert.match(experience, /cakeComplete/);
  assert.match(blessing, /event\.key === "Escape"/);
  assert.match(blessing, /element\.inert = true/);
  assert.match(music, /aria-label=.*volume controls/);
});
