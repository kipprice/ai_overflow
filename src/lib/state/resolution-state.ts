/**
 * What becomes of a resolution once it has been recorded: whether it still stands, the ways
 * back out of it, and rewriting what it says. Recording one is `resolutions`.
 */

import type { Resolution, Topic } from '$lib/types';
import { scheduleSave } from './store.svelte';

/**
 * A context's resolution, but only while it still stands. Callers use this to decide whether
 * to present the question as settled; a reopened resolution is kept only as a record.
 * @param topic - the context to inspect, if there is one.
 * @returns the standing resolution, or `undefined`.
 */
export function activeResolution(topic?: Topic): Resolution | undefined {
  return topic?.resolution?.state === 'active' ? topic.resolution : undefined;
}

/**
 * Takes a question off resolved so it accepts further turns, keeping what was accepted as a
 * record rather than throwing it away.
 * @param topic - the (reactive) context to reopen.
 */
export function reopenResolution(topic: Topic) {
  if (!topic.resolution) return;
  topic.resolution.state = 'reopened';
  scheduleSave();
}

/**
 * Forgets a resolution entirely, including the record a reopened one leaves behind.
 * @param topic - the (reactive) context to clear.
 */
export function discardResolution(topic: Topic) {
  topic.resolution = undefined;
  scheduleSave();
}

/**
 * Rewrites an answer the user wrote themselves, so a typo or an afterthought can be fixed
 * without reopening the question. An accepted answer stays as it is: that one is a record of
 * what a model said. Emptying the note is allowed — the question stays resolved, just with
 * nothing recorded about how.
 * @param topic - the (reactive) context whose resolution is being edited.
 * @param note - the replacement text; may be empty.
 */
export function editOwnAnswer(topic: Topic, note: string) {
  const resolution = topic.resolution;
  if (!resolution || resolution.source === 'accepted') return;
  resolution.text = note.trim();
  // The feed shows these same words: one answer, not two records of it.
  const exchange = topic.exchanges.find((e) => e.id === resolution.exchangeId);
  if (exchange) {
    exchange.answer = resolution.text;
    // Emptying a bare note leaves an exchange with neither question nor answer: nothing to
    // draw in the feed, and nothing worth replaying to a model if the question is reopened.
    if (!exchange.question && !exchange.answer) {
      topic.exchanges = topic.exchanges.filter((e) => e.id !== exchange.id);
      resolution.exchangeId = undefined;
    }
  }
  scheduleSave();
}
