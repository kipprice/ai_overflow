/**
 * Changing a context's tags: the user adding and removing them, and the tagging model's
 * suggestions being merged in. A tag the user removes is remembered, so no later tagging run
 * can put it back.
 */

import { normalizeLabel, toFacet } from '$lib/tags/normalize';
import { knownFacet } from '$lib/tags/vocabulary';
import type { ExtractedTag, Topic } from '$lib/types';
import { scheduleSave } from './store.svelte';

/** Most tags the model may give one context. The user can add more by hand. */
const MAX_AUTO_TAGS = 10;

/**
 * Adds tags the user chose. A tag already in use elsewhere joins its existing facet; a new one
 * is filed under `concept` until it means something more specific. Adding a tag by hand is
 * also how the user takes back an earlier removal.
 * @param topic - the (reactive) context to tag.
 * @param labels - the labels as written; they are normalised here.
 */
export function addUserTags(topic: Topic, labels: string[]) {
  for (const label of labels.map(normalizeLabel).filter(Boolean)) {
    topic.removedTags = topic.removedTags.filter((removed) => removed !== label);
    const existing = topic.tags.find((t) => t.label === label);
    if (existing) existing.source = 'user';
    else topic.tags.push({ label, facet: knownFacet(label) ?? 'concept', source: 'user' });
  }
  scheduleSave();
}

/**
 * Removes a tag for good: it is recorded as removed, so tagging never adds it again.
 * @param topic - the (reactive) context to untag.
 * @param label - the tag to remove.
 */
export function removeTag(topic: Topic, label: string) {
  topic.tags = topic.tags.filter((t) => t.label !== label);
  if (!topic.removedTags.includes(label)) topic.removedTags.push(label);
  scheduleSave();
}

/**
 * Adds the tagging model's suggestions to a context. Tags are only ever added, never replaced:
 * each run sees only the latest exchange, so a tag missing from its reply has not stopped
 * applying to the earlier ones. Removed tags and tags already present are skipped.
 * @param topic - the (reactive) context to tag.
 * @param extracted - the model's suggestions.
 */
export function mergeExtractedTags(topic: Topic, extracted: ExtractedTag[]) {
  for (const suggestion of extracted) {
    const label = normalizeLabel(suggestion.label);
    if (!label || topic.removedTags.includes(label)) continue;
    if (topic.tags.some((t) => t.label === label)) continue;
    if (topic.tags.filter((t) => t.source === 'auto').length >= MAX_AUTO_TAGS) break;
    topic.tags.push({ label, facet: knownFacet(label) ?? toFacet(suggestion.facet), source: 'auto' });
  }
  scheduleSave();
}
