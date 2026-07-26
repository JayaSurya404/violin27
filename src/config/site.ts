import type { SiteConfig } from "@/src/types/site";

const recipientName = "Yazhini Sri";
const recipientFirstName = "Yazhini";

export const siteConfig = {
  metadata: {
    name: "Purple Aurora",
    description:
      "A gentle, cinematic birthday world created to celebrate one wonderful person.",
    shareTitle: `A birthday aurora for ${recipientName}`,
    shareDescription: `An interactive birthday gift made with warmth, wonder, and every good wish for ${recipientName}.`,
    locale: "en-IN",
    timeZone: "Asia/Kolkata",
  },
  recipient: {
    name: recipientName,
    firstName: recipientFirstName,
    birthDate: "2007-07-27",
    displayBirthDate: "27 July 2007",
    turningAge: 19,
  },
  chapters: [
    { id: "arrival", label: "The Arrival" },
    { id: "unlock", label: "The Gift Unlocks" },
    { id: "first-message", label: "A Few Words" },
    { id: "birthday-reveal", label: "The Celebration" },
    { id: "wish-sky", label: "The Sky of Wishes" },
    { id: "story", label: "A Gentle Story" },
    { id: "letter", label: "A Letter for You" },
    { id: "cake", label: "The Birthday Wish" },
    { id: "wish-tree", label: "The Wish Tree" },
    { id: "moon", label: "The Moon's Blessing" },
    { id: "ending", label: "One Last Glow" },
  ],
  arrival: {
    instruction: "Hold to unlock your birthday surprise.",
    shortTapHint: "Keep holding…",
    progressLabel: "Opening your birthday surprise",
    unlockedLabel: "The gift is open",
  },
  openingLines: [
    "Some days deserve more than ordinary wishes.",
    "Some people deserve something made especially for them.",
    "So…",
    "This is for you.",
  ],
  birthdayReveal: {
    kicker: "For a day worth celebrating",
    title: "Happy Birthday",
    name: recipientName,
    subtitle: "A little world, made for your day",
  },
  wishSky: {
    eyebrow: "A sky made of good things",
    title: "The Sky of Wishes",
    introduction:
      "Every star is carrying something gentle for the year ahead.",
    instruction: "Touch a star and let its wish find you.",
    openedLabel: "Wish discovered",
    completeMessage:
      "Every wish is awake now, and together they have made a constellation.",
  },
  wishStars: [
    {
      id: "gentle-joy",
      title: "Gentle joy",
      message:
        "May joy find you in unhurried mornings, familiar songs, and all the little moments that make an ordinary day feel bright.",
      x: 17,
      y: 24,
    },
    {
      id: "brave-beginnings",
      title: "Brave beginnings",
      message:
        "May every new beginning meet you with enough courage to take the first step and enough patience to enjoy the way forward.",
      x: 46,
      y: 14,
    },
    {
      id: "lasting-laughter",
      title: "Lasting laughter",
      message:
        "May this year bring the kind of laughter that stays in the room long after the moment has passed.",
      x: 78,
      y: 27,
    },
    {
      id: "returned-kindness",
      title: "Kindness returned",
      message:
        "May the kindness you offer so naturally return to you in thoughtful people, peaceful places, and unexpected ways.",
      x: 30,
      y: 45,
    },
    {
      id: "growing-dreams",
      title: "Dreams that grow",
      message:
        "May your dreams keep growing at their own beautiful pace, with room to change, surprise you, and become truly yours.",
      x: 67,
      y: 51,
    },
    {
      id: "quiet-peace",
      title: "Quiet peace",
      message:
        "May you always find a quiet corner within yourself where the world feels lighter and you can simply breathe.",
      x: 13,
      y: 70,
    },
    {
      id: "good-company",
      title: "Good company",
      message:
        "May you be surrounded by people who listen well, celebrate you sincerely, and make being yourself feel easy.",
      x: 50,
      y: 76,
    },
    {
      id: "bright-year",
      title: "A bright year",
      message:
        "May the year ahead be generous with meaningful moments, lovely surprises, and reasons to feel proud of how far you have come.",
      x: 84,
      y: 68,
    },
  ],
  story: {
    eyebrow: "Some moments remain",
    title: "A Gentle Story",
    paragraphs: [
      "Some people become part of our memories without ever trying to. A kind word, an easy smile, or one thoughtful moment can be enough to remain.",
      "School days can feel wonderfully ordinary while we are living them. Only later do we notice how their small conversations and shared laughter gave those years their color.",
      "Seasons change, classrooms empty, and everyone grows toward a life of their own. That is not a sad thing; it is simply how a good chapter makes room for the next.",
      "Time may soften the details, but genuine kindness keeps its shape. Goodness noticed sincerely never needs to ask for anything in return.",
      "Today is not about looking backward or asking tomorrow for promises. It is simply a chance to celebrate someone wonderful and wish her a beautiful year ahead.",
    ],
    closing:
      "And that is enough: a warm memory, a bright day, and every good wish offered freely.",
  },
  letter: {
    title: "A Letter for Your Birthday",
    dateStamp: "27 · 07",
    salutation: `Dear ${recipientName},`,
    paragraphs: [
      "A birthday is a lovely reason to pause and celebrate the person someone is, the kindness they have shared, and all the possibility waiting in the year ahead.",
      "Thank you for the quiet, good memories that have remained from ordinary days. Sometimes the simplest moments become the ones time keeps most carefully.",
      "I hope this new year of your life brings work that feels meaningful, people who treat you with care, and enough calm to hear your own thoughts clearly.",
      "May you keep trusting your pace. There is no single schedule for becoming who you are, and no need to make your path look like anyone else's.",
      "Most of all, I hope you feel celebrated today in ways that are easy, sincere, and full of warmth. This little world exists for no reason beyond wishing that for you.",
    ],
    closing: "With respect and the warmest birthday wishes,",
    signature: "Someone who is glad to celebrate your day",
    openPrompt: "Gently open the envelope",
  },
  treeWishes: [
    {
      id: "peace",
      text: "Peace that stays — for calm days, clear thoughts, and room to breathe.",
    },
    {
      id: "courage",
      text: "Courage for what is next — for taking new steps without needing every answer first.",
    },
    {
      id: "laughter",
      text: "Days filled with laughter — for light moments that become favorite memories.",
    },
    {
      id: "kind-company",
      text: "Kind company — for people who value your warmth and respect your heart.",
    },
    {
      id: "dreams",
      text: "Dreams with room to grow — for hopes that can change shape and still lead somewhere lovely.",
    },
    {
      id: "rest",
      text: "Rest whenever you need it — for pauses without guilt and beginnings without hurry.",
    },
  ],
  wishTree: {
    eyebrow: "Good wishes grow when given a place",
    title: "The Wish Tree",
    introduction:
      "These small wishes have been waiting for a branch of their own.",
    instruction:
      "Drag each wish to the tree, or tap a wish and then the tree, and watch it come alive.",
    placedLabel: "Wish placed",
    completeTitle: "The tree is glowing",
    completeMessage:
      "Every branch is carrying something kind for the year ahead.",
  },
  cake: {
    eyebrow: "A birthday tradition, made a little magical",
    title: "One Wish Before the Candles Fade",
    prompt: "Make a birthday wish…",
    subprompt: "…then blow out the candles.",
    permissionTitle: "Bring the candles to life",
    permissionText:
      "Microphone access helps bring this little birthday tradition to life. It is used only here, while you blow out the candles.",
    allowLabel: "Allow microphone",
    deniedTitle: "The candles are still glowing",
    deniedText:
      "Microphone access was not available. You can try again whenever you feel comfortable; the candles will wait patiently.",
    retryLabel: "Try again",
    dismissLabel: "Leave them glowing",
    unavailableTitle: "A little tradition, quietly preserved",
    unavailableText:
      "This browser cannot listen for a birthday wish right now, so the candles will remain softly lit and the moment can still be enjoyed.",
    listeningText: "The candles are listening for your breath",
    successTitle: "Your wish is on its way",
    successText:
      "The flames have become starlight. May the wish behind them find a beautiful path.",
  },
  moon: {
    hint: "The moon remembers thoughtful moments.",
    accessibleLabel: "Touch the moon and discover a little moonlight",
    touchMessages: [
      "A little silver light for the journey.",
      "The moon noticed your curiosity.",
      "Some wonders only appear when we slow down.",
      "A quiet glow has joined the sky.",
      "The night is keeping one final blessing.",
    ],
    blessingEyebrow: "A hidden blessing from the moon",
    blessingTitle: "For the year ahead",
    blessing:
      "May your path be lit without ever asking you to hurry. May kind people meet you at every turn. May you have courage for what is next and peace with where you are. May this new year of your life feel quietly, wonderfully yours.",
  },
  ending: {
    eyebrow: "One last glow",
    title: "May This Year Be Kind to You",
    lines: [
      "May the year ahead be gentle with your heart, generous with your dreams, and full of reasons to smile.",
      "Happy birthday. May today feel peaceful, joyful, and entirely your own.",
    ],
    signature: "Made with warmth, just for your birthday",
    finalLine: "The aurora will keep glowing for a little while.",
  },
  quotes: [
    {
      id: "gentle-memories",
      text: "The gentlest days can hold the brightest memories.",
    },
    {
      id: "kind-constellation",
      text: "Kindness has a way of becoming its own constellation.",
    },
    {
      id: "moon-time",
      text: "Growing is not a race; even the moon takes its time.",
    },
  ],
  hiddenWishes: [
    {
      id: "soft-place",
      label: "A wish tucked between the stars",
      message:
        "May you always find at least one soft place to land on difficult days.",
    },
    {
      id: "proud-moments",
      label: "A wish carried by moonlight",
      message:
        "May you notice the quiet moments that prove how much you have grown.",
    },
    {
      id: "unexpected-good",
      label: "A wish hidden in the aurora",
      message:
        "May something unexpectedly good find you when you need it most.",
    },
  ],
  hiddenMessages: [
    {
      id: "shooting-star",
      trigger: "first-shooting-star",
      message: "You noticed a little piece of passing magic.",
    },
    {
      id: "constellation",
      trigger: "constellation-complete",
      message: "Curiosity turned eight small lights into one bright sky.",
    },
    {
      id: "open-letter",
      trigger: "letter-opened",
      message: "Some words are best opened slowly.",
    },
    {
      id: "cake-wish",
      trigger: "cake-complete",
      message: "A birthday wish has joined the stars.",
    },
    {
      id: "living-tree",
      trigger: "wish-tree-complete",
      message: "Every kind wish has found somewhere to grow.",
    },
  ],
  theme: {
    colors: {
      midnightBlack: "#030208",
      deepPurple: "#180B2E",
      royalViolet: "#7047EB",
      lavender: "#C8B6FF",
      softWhite: "#F7F4FF",
      silver: "#B9B5C7",
      moonGlow: "#EAE6FF",
      auroraBlue: "#58A6FF",
      auroraPink: "#F29BD7",
      warmWhite: "#FFF4E3",
      glassSurface: "#151023",
      glassHighlight: "#EDE7FF",
      focusRing: "#D7C8FF",
    },
    fonts: {
      heading: '"Cormorant Garamond", Georgia, serif',
      body: '"Manrope", system-ui, sans-serif',
      signature: '"Caveat", cursive',
    },
    gradients: {
      background:
        "radial-gradient(circle at 50% 12%, #180B2E 0%, #080410 48%, #030208 100%)",
      aurora:
        "linear-gradient(115deg, #58A6FF 0%, #7047EB 42%, #F29BD7 100%)",
      moon:
        "radial-gradient(circle, #FFF4E3 0%, #EAE6FF 52%, #C8B6FF 100%)",
      warmEnding:
        "linear-gradient(145deg, #FFF4E3 0%, #C8B6FF 45%, #7047EB 100%)",
      glass:
        "linear-gradient(145deg, rgba(237, 231, 255, 0.12), rgba(21, 16, 35, 0.46))",
    },
    atmosphere: {
      beginning: {
        background: "#030208",
        glow: "#180B2E",
        intensity: 0.18,
      },
      middle: {
        background: "#080410",
        glow: "#7047EB",
        intensity: 0.46,
      },
      ending: {
        background: "#180B2E",
        glow: "#FFF4E3",
        intensity: 0.72,
      },
    },
    glass: {
      backgroundOpacity: 0.46,
      borderOpacity: 0.14,
      blurPx: 22,
      noiseOpacity: 0.025,
    },
  },
  experience: {
    initialBlackoutMs: 1000,
    holdDurationMs: 1750,
    shortTapMaximumMs: 420,
    hintDurationMs: 1800,
    moonUnlockInteractions: 5,
    particleCount: 280,
    animationSpeed: 1,
    hapticPatternMs: [12, 36, 18],
    typing: {
      characterIntervalMs: 42,
      linePauseMs: 1250,
    },
    transitions: {
      unlockMs: 2600,
      chapterMs: 1200,
      revealMs: 1800,
      ambientLoopSeconds: 28,
    },
    easing: {
      gentle: [0.22, 1, 0.36, 1],
      cinematic: [0.65, 0, 0.35, 1],
      release: [0.16, 1, 0.3, 1],
    },
    reducedMotion: {
      durationScale: 0.18,
      disableParallax: true,
      disableGyroscope: true,
      disableCameraDrift: true,
      preserveNarrativeTransitions: true,
    },
  },
  performance: {
    targetFps: 60,
    lighthouseTargets: {
      performance: 95,
      accessibility: 95,
      bestPractices: 100,
      seo: 100,
    },
    requiredViewportWidths: [390, 393, 412, 430, 768, 1024, 1440],
    defaultQuality: "medium",
    profiles: {
      low: {
        particleBudget: {
          stars: 160,
          dust: 42,
          sparkles: 12,
          petals: 10,
          fireflies: 10,
          moonDust: 8,
          magic: 16,
          shootingStars: 1,
        },
        maximumDevicePixelRatio: 1.25,
        bloomEnabled: false,
        fogEnabled: true,
        antialias: false,
      },
      medium: {
        particleBudget: {
          stars: 280,
          dust: 72,
          sparkles: 22,
          petals: 16,
          fireflies: 18,
          moonDust: 14,
          magic: 28,
          shootingStars: 1,
        },
        maximumDevicePixelRatio: 1.6,
        bloomEnabled: true,
        fogEnabled: true,
        antialias: true,
      },
      high: {
        particleBudget: {
          stars: 420,
          dust: 110,
          sparkles: 34,
          petals: 24,
          fireflies: 28,
          moonDust: 22,
          magic: 44,
          shootingStars: 2,
        },
        maximumDevicePixelRatio: 2,
        bloomEnabled: true,
        fogEnabled: true,
        antialias: true,
      },
    },
    adaptiveQuality: {
      enabled: true,
      sampleWindowMs: 4000,
      downgradeBelowFps: 48,
      upgradeAboveFps: 57,
      cooldownMs: 9000,
      respectSaveData: true,
    },
    lifecycle: {
      pauseWhenDocumentHidden: true,
      pauseOutsideViewport: true,
      releaseGpuResourcesOnUnmount: true,
    },
  },
  music: {
    autoplay: false,
    optInRequired: true,
    rememberPreference: true,
    preferenceStorageKey: "purple-aurora:music",
    defaultVolume: 0.22,
    fadeInMs: 1800,
    fadeOutMs: 1100,
    track: {
      title: "Aurora for a Birthday",
      artist: "Purple Aurora",
      src: "/audio/purple-aurora.mp3",
      loop: true,
      preload: "none",
    },
  },
  soundEffects: {
    fingerprintPulse: {
      src: "/audio/sfx/fingerprint-pulse.mp3",
      volume: 0.12,
    },
    unlock: {
      src: "/audio/sfx/unlock-bloom.mp3",
      volume: 0.2,
    },
    paper: {
      src: "/audio/sfx/paper-open.mp3",
      volume: 0.14,
    },
    flame: {
      src: "/audio/sfx/candle-flame.mp3",
      volume: 0.1,
    },
    bell: {
      src: "/audio/sfx/wish-bell.mp3",
      volume: 0.18,
    },
    leaves: {
      src: "/audio/sfx/leaves.mp3",
      volume: 0.11,
    },
    moon: {
      src: "/audio/sfx/moon-chime.mp3",
      volume: 0.14,
    },
    sparkle: {
      src: "/audio/sfx/sparkle.mp3",
      volume: 0.1,
    },
    ending: {
      src: "/audio/sfx/warm-piano.mp3",
      volume: 0.18,
    },
  },
  features: {
    music: true,
    soundEffects: true,
    haptics: true,
    gyroscope: true,
    microphone: true,
    tapToExtinguishCandles: false,
    wishConstellation: true,
    wishTree: true,
    moonBlessing: true,
    shootingStars: true,
    adaptiveQuality: true,
    reducedMotion: true,
    offlineFallback: true,
  },
  interface: {
    music: {
      playLabel: "Let the music in",
      pauseLabel: "Pause the music",
      muteLabel: "Mute the music",
      unmuteLabel: "Unmute the music",
      volumeLabel: "Music volume",
      unavailable:
        "The music could not join us, but the story is still complete.",
    },
    letter: {
      envelopeLabel: "Open the birthday letter",
      closeLabel: "Fold the letter",
    },
    wishes: {
      unopenedStarLabel: "Unopened wish star",
      openedStarLabel: "Discovered wish star",
      draggableWishLabel: "Wish ready to be placed on the tree",
    },
    errors: {
      genericTitle: "The stars paused for a moment",
      genericMessage:
        "A small part of the experience could not appear, but the journey can continue.",
      webglTitle: "A gentler sky has appeared",
      webglMessage:
        "This device cannot display the full aurora, so a lighter version is glowing in its place.",
      offlineTitle: "The world is quietly offline",
      offlineMessage:
        "Anything already here will keep glowing. A few sounds may return when the connection does.",
    },
  },
  accessibility: {
    minimumTouchTargetPx: 44,
    respectReducedMotion: true,
    announceChapterChanges: true,
    preserveKeyboardNavigation: true,
    visibleFocusStyles: true,
  },
} as const satisfies SiteConfig;
