/**
 * How a question came to be resolved: by accepting an answer the AI gave, because the user
 * answered their own question in the message that asked it (`question @resolved answer`), or
 * because they found the answer elsewhere and said so with a bare `@resolved`.
 */
export type ResolutionSource = 'accepted' | 'self' | 'manual';

/**
 * Lifecycle of a resolution's summary: `skipped` for anything the user wrote themselves,
 * which is already in their own words, otherwise `pending` until the summary arrives (or
 * `failed`).
 */
export type SummaryStatus = 'skipped' | 'pending' | 'done' | 'failed';

/**
 * Whether a resolution still stands. Reopening a question keeps its resolution as a record
 * of what was once considered the answer, but stops presenting it as settled.
 */
export type ResolutionState = 'active' | 'reopened';

/**
 * How an exchange relates to its context's resolution: not involved, the answer that
 * resolved it, or the answer that resolved it before the question was reopened.
 */
export type Acceptance = 'none' | 'current' | 'past';

/** What settled a question, recorded when the user resolves it. */
export interface Resolution {
  source: ResolutionSource;
  state: ResolutionState;
  /** The accepted answer text, or the note the user wrote after `@resolved`. */
  text: string;
  /** Exchange whose answer resolved the question; absent for a bare `@resolved` note. */
  exchangeId?: string;
  /** One-line summary of the resolution; `null` until a model writes one. */
  summary: string | null;
  summaryStatus: SummaryStatus;
  createdAt: number;
}
