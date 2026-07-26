export type ISODate = `${number}-${number}-${number}`;
export type HexColor = `#${string}`;
export type PublicAudioPath = `/audio/${string}`;
export type CubicBezier = readonly [
  x1: number,
  y1: number,
  x2: number,
  y2: number,
];

export type ChapterId =
  | "arrival"
  | "unlock"
  | "first-message"
  | "birthday-reveal"
  | "wish-sky"
  | "story"
  | "letter"
  | "cake"
  | "wish-tree"
  | "moon"
  | "ending";

export type WishStarId =
  | "gentle-joy"
  | "brave-beginnings"
  | "lasting-laughter"
  | "returned-kindness"
  | "growing-dreams"
  | "quiet-peace"
  | "good-company"
  | "bright-year";

export type TreeWishId =
  | "peace"
  | "courage"
  | "laughter"
  | "kind-company"
  | "dreams"
  | "rest";

export type HiddenMessageTrigger =
  | "first-shooting-star"
  | "constellation-complete"
  | "letter-opened"
  | "cake-complete"
  | "wish-tree-complete";

export type QualityTier = "low" | "medium" | "high";

export interface SiteMetadata {
  readonly name: string;
  readonly description: string;
  readonly shareTitle: string;
  readonly shareDescription: string;
  readonly locale: string;
  readonly timeZone: string;
}

export interface RecipientConfig {
  readonly name: string;
  readonly firstName: string;
  readonly birthDate: ISODate;
  readonly displayBirthDate: string;
  readonly turningAge: number;
}

export interface ChapterConfig {
  readonly id: ChapterId;
  readonly label: string;
}

export interface ArrivalCopy {
  readonly instruction: string;
  readonly shortTapHint: string;
  readonly progressLabel: string;
  readonly unlockedLabel: string;
}

export interface BirthdayRevealConfig {
  readonly kicker: string;
  readonly title: string;
  readonly name: string;
  readonly subtitle: string;
}

export interface WishStarConfig {
  readonly id: WishStarId;
  readonly title: string;
  readonly message: string;
  /** Horizontal position in the wish sky, expressed as a percentage from 0–100. */
  readonly x: number;
  /** Vertical position in the wish sky, expressed as a percentage from 0–100. */
  readonly y: number;
}

export interface WishSkyCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly introduction: string;
  readonly instruction: string;
  readonly openedLabel: string;
  readonly completeMessage: string;
}

export interface StoryConfig {
  readonly eyebrow: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly closing: string;
}

export interface LetterConfig {
  readonly title: string;
  readonly dateStamp: string;
  readonly salutation: string;
  readonly paragraphs: readonly string[];
  readonly closing: string;
  readonly signature: string;
  readonly openPrompt: string;
}

export interface TreeWishConfig {
  readonly id: TreeWishId;
  readonly text: string;
}

export interface WishTreeCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly introduction: string;
  readonly instruction: string;
  readonly placedLabel: string;
  readonly completeTitle: string;
  readonly completeMessage: string;
}

export interface CakeConfig {
  readonly eyebrow: string;
  readonly title: string;
  readonly prompt: string;
  readonly subprompt: string;
  readonly permissionTitle: string;
  readonly permissionText: string;
  readonly allowLabel: string;
  readonly deniedTitle: string;
  readonly deniedText: string;
  readonly retryLabel: string;
  readonly dismissLabel: string;
  readonly unavailableTitle: string;
  readonly unavailableText: string;
  readonly listeningText: string;
  readonly successTitle: string;
  readonly successText: string;
}

export interface MoonConfig {
  readonly hint: string;
  readonly accessibleLabel: string;
  readonly touchMessages: readonly string[];
  readonly blessingEyebrow: string;
  readonly blessingTitle: string;
  readonly blessing: string;
}

export interface EndingConfig {
  readonly eyebrow: string;
  readonly title: string;
  readonly lines: readonly string[];
  readonly signature: string;
  readonly finalLine: string;
}

export interface QuoteConfig {
  readonly id: string;
  readonly text: string;
}

export interface HiddenWishConfig {
  readonly id: string;
  readonly label: string;
  readonly message: string;
}

export interface HiddenMessageConfig {
  readonly id: string;
  readonly trigger: HiddenMessageTrigger;
  readonly message: string;
}

export interface ThemeColors {
  readonly midnightBlack: HexColor;
  readonly deepPurple: HexColor;
  readonly royalViolet: HexColor;
  readonly lavender: HexColor;
  readonly softWhite: HexColor;
  readonly silver: HexColor;
  readonly moonGlow: HexColor;
  readonly auroraBlue: HexColor;
  readonly auroraPink: HexColor;
  readonly warmWhite: HexColor;
  readonly glassSurface: HexColor;
  readonly glassHighlight: HexColor;
  readonly focusRing: HexColor;
}

export interface ThemeConfig {
  readonly colors: ThemeColors;
  readonly fonts: {
    readonly heading: string;
    readonly body: string;
    readonly signature: string;
  };
  readonly gradients: {
    readonly background: string;
    readonly aurora: string;
    readonly moon: string;
    readonly warmEnding: string;
    readonly glass: string;
  };
  readonly atmosphere: {
    readonly beginning: {
      readonly background: HexColor;
      readonly glow: HexColor;
      readonly intensity: number;
    };
    readonly middle: {
      readonly background: HexColor;
      readonly glow: HexColor;
      readonly intensity: number;
    };
    readonly ending: {
      readonly background: HexColor;
      readonly glow: HexColor;
      readonly intensity: number;
    };
  };
  readonly glass: {
    readonly backgroundOpacity: number;
    readonly borderOpacity: number;
    readonly blurPx: number;
    readonly noiseOpacity: number;
  };
}

export interface ExperienceConfig {
  readonly initialBlackoutMs: number;
  readonly holdDurationMs: number;
  readonly shortTapMaximumMs: number;
  readonly hintDurationMs: number;
  readonly moonUnlockInteractions: number;
  readonly particleCount: number;
  readonly animationSpeed: number;
  readonly hapticPatternMs: readonly number[];
  readonly typing: {
    readonly characterIntervalMs: number;
    readonly linePauseMs: number;
  };
  readonly transitions: {
    readonly unlockMs: number;
    readonly chapterMs: number;
    readonly revealMs: number;
    readonly ambientLoopSeconds: number;
  };
  readonly easing: {
    readonly gentle: CubicBezier;
    readonly cinematic: CubicBezier;
    readonly release: CubicBezier;
  };
  readonly reducedMotion: {
    readonly durationScale: number;
    readonly disableParallax: true;
    readonly disableGyroscope: true;
    readonly disableCameraDrift: true;
    readonly preserveNarrativeTransitions: true;
  };
}

export interface ParticleBudget {
  readonly stars: number;
  readonly dust: number;
  readonly sparkles: number;
  readonly petals: number;
  readonly fireflies: number;
  readonly moonDust: number;
  readonly magic: number;
  readonly shootingStars: number;
}

export interface QualityProfile {
  readonly particleBudget: ParticleBudget;
  readonly maximumDevicePixelRatio: number;
  readonly bloomEnabled: boolean;
  readonly fogEnabled: boolean;
  readonly antialias: boolean;
}

export interface PerformanceConfig {
  readonly targetFps: number;
  readonly lighthouseTargets: {
    readonly performance: number;
    readonly accessibility: number;
    readonly bestPractices: number;
    readonly seo: number;
  };
  readonly requiredViewportWidths: readonly number[];
  readonly defaultQuality: QualityTier;
  readonly profiles: Readonly<Record<QualityTier, QualityProfile>>;
  readonly adaptiveQuality: {
    readonly enabled: true;
    readonly sampleWindowMs: number;
    readonly downgradeBelowFps: number;
    readonly upgradeAboveFps: number;
    readonly cooldownMs: number;
    readonly respectSaveData: true;
  };
  readonly lifecycle: {
    readonly pauseWhenDocumentHidden: true;
    readonly pauseOutsideViewport: true;
    readonly releaseGpuResourcesOnUnmount: true;
  };
}

export interface MusicConfig {
  readonly autoplay: false;
  readonly optInRequired: true;
  readonly rememberPreference: true;
  readonly preferenceStorageKey: string;
  readonly defaultVolume: number;
  readonly fadeInMs: number;
  readonly fadeOutMs: number;
  readonly track: {
    readonly title: string;
    readonly artist: string;
    readonly src: PublicAudioPath;
    readonly loop: true;
    readonly preload: "none" | "metadata";
  };
}

export interface SoundEffect {
  readonly src: PublicAudioPath;
  readonly volume: number;
}

export interface SoundEffectsConfig {
  readonly fingerprintPulse: SoundEffect;
  readonly unlock: SoundEffect;
  readonly paper: SoundEffect;
  readonly flame: SoundEffect;
  readonly bell: SoundEffect;
  readonly leaves: SoundEffect;
  readonly moon: SoundEffect;
  readonly sparkle: SoundEffect;
  readonly ending: SoundEffect;
}

export interface FeatureFlags {
  readonly music: boolean;
  readonly soundEffects: boolean;
  readonly haptics: boolean;
  readonly gyroscope: boolean;
  readonly microphone: true;
  readonly tapToExtinguishCandles: false;
  readonly wishConstellation: boolean;
  readonly wishTree: boolean;
  readonly moonBlessing: boolean;
  readonly shootingStars: boolean;
  readonly adaptiveQuality: boolean;
  readonly reducedMotion: boolean;
  readonly offlineFallback: boolean;
}

export interface InterfaceCopy {
  readonly music: {
    readonly playLabel: string;
    readonly pauseLabel: string;
    readonly muteLabel: string;
    readonly unmuteLabel: string;
    readonly volumeLabel: string;
    readonly unavailable: string;
  };
  readonly letter: {
    readonly envelopeLabel: string;
    readonly closeLabel: string;
  };
  readonly wishes: {
    readonly unopenedStarLabel: string;
    readonly openedStarLabel: string;
    readonly draggableWishLabel: string;
  };
  readonly errors: {
    readonly genericTitle: string;
    readonly genericMessage: string;
    readonly webglTitle: string;
    readonly webglMessage: string;
    readonly offlineTitle: string;
    readonly offlineMessage: string;
  };
}

export interface AccessibilityConfig {
  readonly minimumTouchTargetPx: number;
  readonly respectReducedMotion: true;
  readonly announceChapterChanges: true;
  readonly preserveKeyboardNavigation: true;
  readonly visibleFocusStyles: true;
}

export interface SiteConfig {
  readonly metadata: SiteMetadata;
  readonly recipient: RecipientConfig;
  readonly chapters: readonly ChapterConfig[];
  readonly arrival: ArrivalCopy;
  readonly openingLines: readonly string[];
  readonly birthdayReveal: BirthdayRevealConfig;
  readonly wishSky: WishSkyCopy;
  readonly wishStars: readonly WishStarConfig[];
  readonly story: StoryConfig;
  readonly letter: LetterConfig;
  readonly treeWishes: readonly TreeWishConfig[];
  readonly wishTree: WishTreeCopy;
  readonly cake: CakeConfig;
  readonly moon: MoonConfig;
  readonly ending: EndingConfig;
  readonly quotes: readonly QuoteConfig[];
  readonly hiddenWishes: readonly HiddenWishConfig[];
  readonly hiddenMessages: readonly HiddenMessageConfig[];
  readonly theme: ThemeConfig;
  readonly experience: ExperienceConfig;
  readonly performance: PerformanceConfig;
  readonly music: MusicConfig;
  readonly soundEffects: SoundEffectsConfig;
  readonly features: FeatureFlags;
  readonly interface: InterfaceCopy;
  readonly accessibility: AccessibilityConfig;
}

// Public content aliases keep section props concise while preserving one schema.
export type CakeContent = CakeConfig;
export type LetterContent = LetterConfig;
export type WishStar = WishStarConfig;
export type TreeWish = TreeWishConfig;

export interface StoryBeat {
  readonly id: string;
  readonly text: string;
}
