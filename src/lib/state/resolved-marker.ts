/**
 * The `@resolved` composer marker: how a user says they found the answer themselves.
 * Recognising it is its own concern, kept apart from the resolutions it goes on to record.
 */

/** Marker that records a resolution the user found themselves, instead of asking the AI. */
export const RESOLVED_MARKER = '@resolved';

/** The marker, where it stands on its own rather than inside a longer word. */
const MARKER_PATTERN = /(^|\s)@resolved(?=\s|$)/i;

/** A message the user marked resolved: what was asked, and what settled it. */
export interface MarkedResolution {
  /** Text before the marker: a question answered in the same breath. Empty when there is none. */
  question: string;
  /** Text after the marker: the answer to that question, or a bare note. May be empty. */
  answer: string;
}

/**
 * Reads a `@resolved` message from the composer. Recognising it here is what keeps the
 * message out of the harness: nothing a user marks resolved themselves is sent to a model.
 *
 * The marker splits the message, so `how do I X? @resolved like this` asks and answers at
 * once; with nothing before it, the message only resolves the open context.
 * @param text - the composer text.
 * @returns the two halves of the message, or `null` for a normal question.
 */
export function readResolvedMarker(text: string): MarkedResolution | null {
  const match = MARKER_PATTERN.exec(text);
  if (!match) return null;
  const start = match.index + match[1].length;
  return {
    question: text.slice(0, start).trim(),
    answer: text.slice(start + RESOLVED_MARKER.length).trim(),
  };
}
