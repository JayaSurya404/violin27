export type StoryChapter = { number: string; eyebrow: string; title: string; body: string };
export type SiteConfig = {
  person: string; creator: string; opening: string[]; chapters: StoryChapter[]; letter: string[];
  wishes: string[]; music: { title: string; artist: string; src?: string }; colors: Record<string, string>;
  intro: string; quotes: { music: string; musicEmphasis: string; letterPrompt: string }; loveMessage: { lead: string; simple: string; reveal: string }; noPressure: string[];
  final: { first: string; second: string; signature: string }; flags: { audio: boolean; webgl: boolean };
};
