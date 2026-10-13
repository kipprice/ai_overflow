import type { Harness, Session, Topic } from './feed';

/** Colour scheme: follow macOS, or force light or dark. */
export type Appearance = 'system' | 'light' | 'dark';

/** User preferences, persisted alongside the feed. */
export interface Settings {
  appearance: Appearance;
  harness: Harness;
  claudeModel: string;
  claudeEffort: string;
  ollamaModel: string;
  ollamaEffort: string;
  themeHarness: Harness;
  themeClaudeModel: string;
  themeOllamaModel: string;
  ollamaUrl: string;
  /** Explicit path to the `claude` CLI; blank means auto-detect. */
  claudePath: string;
  /** Working folder for Claude; blank means the app's private workspace. */
  claudeCwd: string;
}

/** Everything persisted to disk. */
export interface AppData {
  version: 1;
  settings: Settings;
  sessions: Session[];
  topics: Topic[];
  currentSessionId: string;
  /** The context shown in the feed; `null` for a fresh context with no questions yet. */
  currentTopicId: string | null;
  /** Context the next fresh question should continue; set by forking a resolved one. */
  forkFromTopicId: string | null;
  /** Slash commands last reported by the Claude CLI. */
  claudeCommands: string[];
}
