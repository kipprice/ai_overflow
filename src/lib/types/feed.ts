import type { Resolution } from './resolution';
import type { Tag, TagStatus } from './tag';

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
  /** Model that answered; empty when the user answered it themselves. */
  model: string;
  /** Effort level used; empty string means the harness default. */
  effort: string;
  createdAt: number;
  status: 'streaming' | 'done' | 'error';
  error?: string;
  /** Set when the user wrote the answer themselves, so no model was asked. */
  selfAnswered?: boolean;
  /** How tagging its context from this exchange went; absent if it never ran. */
  tagging?: TagStatus;
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
  /** Set once the user has marked the question answered. */
  resolution?: Resolution;
  /** Context this one continues, when it was started by forking a resolved question. */
  forkedFromId?: string;
  tags: Tag[];
  /** Labels the user removed. They stay removed: tagging never puts them back. */
  removedTags: string[];
}

/** A group of topics shown together in the sidebar. */
export interface Session {
  id: string;
  createdAt: number;
}
