/**
 * `#tag` tokens in composer text. A `#` only starts a tag at the start of a word and only when
 * a letter follows it, so `C#`, `# headings` and issue numbers like `#42` are left alone.
 */

import { normalizeLabel } from './normalize';

/** A `#tag` standing on its own: at the start of the text or after whitespace. */
const TAG_TOKEN = /(^|\s)#(\p{L}\S*)/gu;

/** Composer text with its `#tag` tokens taken out. */
export interface TaggedText {
  /** The tags, normalised, without duplicates. */
  labels: string[];
  /** The text with the tokens removed. */
  text: string;
}

/**
 * Splits the `#tag` tokens off a message, so tags can be added while asking and the model
 * only ever sees the question.
 *
 * Each token goes with the space in front of it, and nothing else is touched: a question may
 * carry pasted code whose indentation matters.
 * @param text - the composer text.
 * @returns the tags, and the text left once they are removed.
 */
export function readTagTokens(text: string): TaggedText {
  const labels = new Set<string>();
  const rest = text.replace(TAG_TOKEN, (token: string, lead: string, raw: string) => {
    const label = normalizeLabel(raw);
    if (!label) return token;
    labels.add(label);
    return lead === '\n' ? lead : '';
  });
  return { labels: [...labels], text: rest.trim() };
}
