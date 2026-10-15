/**
 * Every tag in use across the whole feed, with how often each is used. It is derived from the
 * contexts rather than stored, so it can never fall out of step with them: deleting the last
 * context with a tag is all it takes for the tag to disappear.
 */

import { store } from '$lib/state/store.svelte';
import type { TagFacet } from '$lib/types';

/** One tag in use, and how many contexts carry it. */
export interface VocabularyEntry {
  label: string;
  facet: TagFacet;
  count: number;
}

/** Most suggestions shown while typing a tag. */
const MAX_SUGGESTIONS = 8;

/** Most labels sent to the tagging model, to keep its prompt cheap. */
const MAX_PROMPT_LABELS = 40;

/**
 * Every tag in use, most used first. A tag's facet is the one it was first filed under.
 * @returns the vocabulary.
 */
export function vocabulary(): VocabularyEntry[] {
  const entries = new Map<string, VocabularyEntry>();
  for (const tag of store.data.topics.flatMap((t) => t.tags)) {
    const entry = entries.get(tag.label);
    if (entry) entry.count++;
    else entries.set(tag.label, { label: tag.label, facet: tag.facet, count: 1 });
  }
  return [...entries.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * Tags in use that match what the user is typing: those starting with it first, then those
 * merely containing it, each group most used first.
 * @param query - the label typed so far; empty lists the most used tags.
 * @param exclude - labels to leave out, such as those the context already has.
 * @returns the suggestions.
 */
export function suggestTags(query: string, exclude: string[] = []): VocabularyEntry[] {
  const q = query.toLowerCase();
  const open = vocabulary().filter((e) => !exclude.includes(e.label) && e.label.includes(q));
  const prefix = open.filter((e) => e.label.startsWith(q));
  const partial = open.filter((e) => !e.label.startsWith(q));
  return [...prefix, ...partial].slice(0, MAX_SUGGESTIONS);
}

/**
 * The labels the tagging model is asked to prefer, so it reuses the feed's own words.
 * @returns the most used labels.
 */
export function promptVocabulary(): string[] {
  return vocabulary()
    .slice(0, MAX_PROMPT_LABELS)
    .map((e) => e.label);
}

/**
 * The facet a label is already filed under, so a tag typed by hand joins its existing group.
 * @param label - a normalised label.
 * @returns the facet in use, or `undefined` for a new tag.
 */
export function knownFacet(label: string): TagFacet | undefined {
  return store.data.topics.flatMap((t) => t.tags).find((t) => t.label === label)?.facet;
}
