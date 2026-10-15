/**
 * Reading what the user typed into search. `#rust` (or `tag:rust`) asks for contexts tagged
 * `rust`; every other word is looked for in the contexts' text.
 */

import { normalizeLabel } from '$lib/tags/normalize';

/** A search, split into the tags a context must carry and the words its text must contain. */
export interface SearchQuery {
  tags: string[];
  words: string[];
}

/** Prefixes that make a search term a tag rather than a word. */
const TAG_PREFIXES = ['#', 'tag:'];

/**
 * Splits a search into tags and words.
 * @param raw - the search as typed.
 * @returns the tags (normalised) and words (lowercased) to match.
 */
export function parseQuery(raw: string): SearchQuery {
  const query: SearchQuery = { tags: [], words: [] };
  for (const term of raw.toLowerCase().split(/\s+/).filter(Boolean)) {
    const prefix = TAG_PREFIXES.find((p) => term.startsWith(p) && term.length > p.length);
    if (prefix) query.tags.push(normalizeLabel(term.slice(prefix.length)));
    else query.words.push(term);
  }
  return query;
}

/**
 * Whether a search asks for anything at all.
 * @param query - the parsed search.
 * @returns true if it has at least one tag or word.
 */
export function isEmptyQuery(query: SearchQuery): boolean {
  return query.tags.length === 0 && query.words.length === 0;
}
