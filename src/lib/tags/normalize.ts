/**
 * The rules every tag label follows, wherever it came from: typed by the user, written after
 * `#` in the composer, or suggested by the tagging model. Keeping them in one place is what
 * stops `TypeScript`, `typescript` and `type script` becoming three different tags.
 */

import type { TagFacet } from '$lib/types';

/** Longest label we keep, in characters. */
const MAX_LABEL_CHARS = 30;

/** Characters a label may hold besides letters and digits: enough for `c++`, `c#`, `node.js`. */
const NOT_LABEL_CHAR = /[^\p{L}\p{N}+#._-]/gu;

/** Facets a tag may be filed under. */
export const TAG_FACETS: TagFacet[] = ['language', 'tool', 'concept', 'domain'];

/**
 * Puts a label into the one form tags are stored in: lowercase, hyphens for spaces, no
 * punctuation beyond what names like `c++` need, and no stray hyphens at either end.
 * @param raw - the label as written.
 * @returns the normalised label; empty when nothing usable is left.
 */
export function normalizeLabel(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, '')
    .replace(/\s+/g, '-')
    .replace(NOT_LABEL_CHAR, '')
    .replace(/-{2,}/g, '-')
    .slice(0, MAX_LABEL_CHARS)
    .replace(/^[-.]+|[-.]+$/g, '');
}

/**
 * Reads a facet name, filing anything unrecognised under `concept`, the catch-all.
 * @param raw - the facet as written.
 * @returns a known facet.
 */
export function toFacet(raw: string): TagFacet {
  return TAG_FACETS.find((f) => f === raw.trim().toLowerCase()) ?? 'concept';
}
