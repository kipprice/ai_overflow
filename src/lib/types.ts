/** The backend that answers questions. */
export type Harness = 'claude' | 'ollama';

/** A tool the model invoked while answering (e.g. a web search). */
export interface ToolCall {
  name: string;
  detail: string;
}

/** One question and everything streamed back in reply. */
export interface Exchange {
  id: string;
  question: string;
  answer: string;
  thinking: string;
  tools: ToolCall[];
  harness: Harness;
  model: string;
  /** Effort level used; empty string means the harness default. */
  effort: string;
  createdAt: number;
  status: 'streaming' | 'done' | 'error';
  error?: string;
}

/**
 * Lifecycle of a topic's theme: `pending` while the theme model labels the first question,
 * then `done` (or `failed`, using a fallback label).
 */
export type ThemeStatus = 'pending' | 'done' | 'failed';

/** One context: a conversation started by a question and continued until /clear. */
export interface Topic {
  id: string;
  sessionId: string;
  theme: string | null;
  themeStatus: ThemeStatus;
  createdAt: number;
  exchanges: Exchange[];
  /** Claude CLI session to resume for the next turn in this context. */
  claudeSessionId?: string;
}

/** A group of topics shown together in the sidebar. */
export interface Session {
  id: string;
  createdAt: number;
}

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
  /** Slash commands last reported by the Claude CLI. */
  claudeCommands: string[];
}
