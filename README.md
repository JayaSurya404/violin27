# Purple Aurora

Purple Aurora is a mobile-first, cinematic birthday experience created for
Yazhini Sri. It unfolds as one continuous moonlit world: a long-press gift
unlock, an aurora-lit birthday reveal, interactive wishes, a letter, a wish
tree, a microphone-driven candle ceremony, and a quiet ending.

The project is built with Next.js 16, React 19, TypeScript, Tailwind CSS,
Framer Motion, GSAP, Three.js, and React Three Fiber. Motion, sound, microphone
access, and WebGL are enhancements; the story remains readable when a device
cannot provide them.

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer
- A modern browser for the complete WebGL and Web Audio experience

No environment variables, database, or external service credentials are
required.

## Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local development runs
through vinext and includes hot reload.

Before publishing a change, run the complete verification set:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

To inspect the production build locally:

```bash
npm run build
npm run start
```

`npm run build` creates and verifies the vinext/Sites deployment output.
`npm run build:next` creates the native Next.js build used by Vercel.

## Customize the gift

Personal content and experience tuning live in
[`src/config/site.ts`](src/config/site.ts). Change that file instead of placing
recipient-specific text inside components.

It is the central source for:

- recipient name and birthday
- opening lines, story chapters, letter, wishes, and moon blessing
- music metadata and public audio paths
- aurora colors and other theme values
- particle density and animation speed
- optional feature flags

Keep public asset paths root-relative, for example
`/audio/purple-aurora.mp3` rather than
`public/audio/purple-aurora.mp3`. TypeScript will catch missing or misspelled
configuration fields, while the browser handles an unavailable media file
without interrupting the experience.

### Replace audio

The default ambience and interaction cues are synthesized with the Web Audio
API, so a fresh checkout has no required audio downloads. To use a recorded
track:

1. Put the compressed, web-ready file in `public/audio/`.
2. Set `music.track.src` in `src/config/site.ts` to its root-relative path.
3. Keep the filename lowercase and URL-safe.
4. Test once with audio enabled, once muted, and once with the file temporarily
   unavailable.

Individual recorded cues belong in `public/audio/sfx/`. Their paths and mix
levels are configured under `soundEffects`; each cue has `src` and `volume`
values. The supplied names use `/audio/purple-aurora.mp3` for music and
`/audio/sfx/*.mp3` for cues. These files are optional because synthesized tones
provide the graceful fallback.

MP3 is the safest single-file music format for the target mobile browsers.
Keep background music modest in size and normalize sound effects to a gentle
volume. Browsers block unsolicited playback, so music begins only after the
visitor opts in; do not remove that interaction.

### Replace images and other assets

Place static files under `public/` in a descriptive folder such as
`public/images/`, then reference them with a root-relative URL such as
`/images/moon-texture.webp`. Prefer AVIF or WebP for photographs, optimized SVG
for simple artwork, and appropriately sized textures for the Three.js scene.
Avoid importing a file from `public/` into TypeScript.

After replacing an asset, verify its exact filename on a case-sensitive file
system. A path that works on Windows can otherwise fail after deployment.

### Tune theme and performance

Use the typed values in `src/config/site.ts`; the components consume them
throughout the experience:

- `theme.colors`, `theme.fonts`, `theme.gradients`, `theme.atmosphere`, and
  `theme.glass` define the visual system.
- `experience.animationSpeed`, `experience.typing`, and
  `experience.transitions` control narrative pacing.
- `experience.particleCount` is the baseline atmosphere density.
- `performance.defaultQuality` selects the initial `low`, `medium`, or `high`
  profile. Each profile owns its particle budget, maximum device pixel ratio,
  bloom, fog, and antialias settings.
- `performance.adaptiveQuality` defines automatic quality switching.
- `features` enables optional capabilities. Keep
  `features.tapToExtinguishCandles` set to `false`; microphone-based blowing is
  intentionally the only candle gesture.

- Keep foreground text readable against every aurora state.
- Reduce particle counts before removing narrative feedback.
- Keep animation-speed changes subtle so hold durations and readable pauses
  still feel intentional.
- Treat higher particle density, bloom, and device pixel ratio as a combined
  GPU cost. Test changes on a mid-range phone, not only a desktop.
- Leave adaptive quality enabled for normal deployments. It lowers visual
  complexity when rendering performance drops.

The application also honors `prefers-reduced-motion`. That mode shortens or
replaces spatial movement while preserving content, interaction feedback, and
chapter progression.

## Project structure

```text
app/
  layout.tsx              Root document, metadata, and fonts
  page.tsx                Continuous experience entry point
  globals.css             Design tokens, global styles, and fallbacks
src/
  config/site.ts          Personal content, theme, tuning, and feature flags
  types/site.ts           Type contract for the central configuration
  components/
    BirthdayExperience.tsx  Chapter progression and experience orchestration
                            plus reusable interface primitives
  experience/
    AuroraWorld.tsx         Shared WebGL world
    SceneFallback.tsx       Non-WebGL atmospheric fallback
  sections/                 Arrival, hero, wishes, story, letter, cake,
                            wish tree, and ending chapters
  hooks/                  Device capability and interaction hooks
  lib/                    Focused runtime helpers
public/
  audio/                  Optional recorded music and sound effects
  images/                 Optional optimized static artwork
tests/                    Automated rendering checks
```

The App Router owns the document shell. The client-side experience orchestrates
chapter state, while focused sections own their interaction logic. A single
shared world provides the aurora, moon, stars, and atmospheric continuity
instead of mounting unrelated scenes for each chapter.

## Capability fallbacks

### Microphone

Microphone access is requested only when the visitor reaches the candle
ceremony. If permission is denied, the interface explains why it is useful and
offers Retry. If capture or Web Audio is unavailable, the scene remains
visually complete and displays a calm limitation message. There is
intentionally no tap-to-extinguish substitute: blowing is the ceremony's only
completion gesture.

For realistic testing, use `localhost` or HTTPS. Browsers do not expose
microphone capture to ordinary insecure origins.

### WebGL and device performance

The Three.js world is loaded as an enhancement. When WebGL is unavailable or
initialization fails, layered CSS gradients, stars, and glow preserve the
setting without presenting a blank screen. Adaptive quality reduces costly
effects on constrained devices. Device motion and vibration are optional and
silently degrade when unsupported.

Always test the fallback path as well as the full scene. In browser developer
tools, disable WebGL or emulate reduced motion, and separately deny microphone
permission.

## Deploy to Vercel

The repository includes `vercel.json`, so Vercel selects the Next.js framework
and runs `npm run build:next` automatically.

1. Push the repository to a private Git provider repository.
2. Import it into Vercel.
3. Keep the detected root directory and all other project settings unchanged.
4. Deploy.

No environment variables are needed. The resulting HTTPS origin supports
microphone permission prompts and can be shared directly. Before sharing the
link, test the production deployment on a real phone with audio both accepted
and declined, microphone permission granted and denied, reduced motion
enabled, and a slow network connection.

Static audio and image files are part of the deployment, so commit everything
referenced from `src/config/site.ts`. Do not rely on local absolute paths.

## Browser and accessibility notes

- The primary target is a modern Android browser; current Safari, Chrome,
  Edge, and Firefox receive the core narrative.
- All meaningful controls remain keyboard reachable and expose accessible
  names.
- Touch targets are at least 44 by 44 CSS pixels and account for device safe
  areas.
- Music is opt-in, and mute and volume choices are remembered locally.

## License

Purple Aurora is a personal gift, not an open-source template. The source is
available under the terms in [`LICENSE`](LICENSE): personal, non-commercial
use and private customization are permitted; resale, commercial use, and
redistribution are not. Third-party packages and assets remain subject to
their own licenses.
