/**
 * Running the tagging model over a context, one exchange at a time. It runs after every
 * answered prompt, so a follow-up that brings in something new gets tagged for it too;
 * earlier tags are kept. Exchanges it never ran for — saved before tagging existed, or whose
 * run failed — can be autotagged from the feed.
 */

import { extractTags } from '$lib/ipc/helpers';
import { promptVocabulary } from '$lib/tags/vocabulary';
import type { Exchange, Topic } from '$lib/types';
import { scheduleSave, store } from './store.svelte';
import { mergeExtractedTags } from './tag-edit';
import { isConversational } from './transcript';

/**
 * Tags a context from one of its exchanges. Slash commands, failures and empty answers have
 * nothing to tag and are skipped.
 * @param topic - the (reactive) context the exchange belongs to.
 * @param exchange - the (reactive) exchange to tag from.
 * @returns resolves once tagging has finished or failed.
 */
export async function tagExchange(topic: Topic, exchange: Exchange) {
  if (!isConversational(exchange)) return;
  exchange.tagging = 'pending';
  try {
    const { question, answer } = exchange;
    const extracted = await extractTags(store.data.settings, question, answer, promptVocabulary());
    mergeExtractedTags(topic, extracted);
    exchange.tagging = 'done';
  } catch (err) {
    console.warn('Tag extraction failed', err);
    exchange.tagging = 'failed';
  }
  scheduleSave();
}

/**
 * Whether an exchange can be autotagged by hand: it has something to tag from, and tagging
 * has never run for it or last failed.
 * @param exchange - the exchange to check.
 * @returns true if the feed should offer to autotag it.
 */
export function canAutotag(exchange: Exchange): boolean {
  return isConversational(exchange) && (exchange.tagging === undefined || exchange.tagging === 'failed');
}

/**
 * Where a context stands for autotagging by hand: `pending` while a run is underway,
 * `failed` if one of its exchanges' runs failed, `ready` if some exchange was never tagged,
 * and `done` when there is nothing left to offer.
 * @param topic - the context to check.
 * @returns the context's autotag status.
 */
export function autotagStatus(topic: Topic): 'pending' | 'failed' | 'ready' | 'done' {
  const { exchanges } = topic;
  if (exchanges.some((e) => e.tagging === 'pending')) return 'pending';
  if (exchanges.some((e) => isConversational(e) && e.tagging === 'failed')) return 'failed';
  return exchanges.some(canAutotag) ? 'ready' : 'done';
}

/**
 * Tags a context, at the user's request, from each of its exchanges tagging never ran for
 * or failed on. They run one after another, so each merge sees the tags before it.
 * @param topic - the (reactive) context to tag.
 * @returns resolves once every run has finished or failed.
 */
export async function autotagTopic(topic: Topic) {
  for (const exchange of topic.exchanges.filter(canAutotag)) {
    await tagExchange(topic, exchange);
  }
}

/** Re-runs tagging for exchanges left pending when the app last closed. */
export function resumePendingTags() {
  for (const topic of store.data.topics) {
    topic.exchanges.filter((e) => e.tagging === 'pending').forEach((e) => void tagExchange(topic, e));
  }
}
