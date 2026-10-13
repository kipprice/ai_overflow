/**
 * Recording what settled a question. The `@resolved` marker that starts a manual resolution
 * is parsed in `resolved-marker`; what happens to a resolution afterwards lives in
 * `resolution-state`.
 */

import type { ResolutionSource, SummaryStatus, Topic } from '$lib/types';
import { summariseResolution } from './resolution-summary';
import { scheduleSave, store } from './store.svelte';

/**
 * Records an answer, or a highlighted part of one, as what resolved its context, then kicks
 * off a short summary of it.
 * @param exchangeId - the exchange whose answer was accepted.
 * @param text - the accepted text.
 */
export function resolveWithAnswer(exchangeId: string, text: string) {
  const topic = pinAnswer('accepted', exchangeId, text, 'pending');
  if (topic) void summariseResolution(topic);
}

/**
 * Records the answer the user wrote themselves for the question they just asked. No model is
 * asked to summarise it: the user already put it in their own words, and running those back
 * through a model would only paraphrase what they meant to record.
 * @param exchangeId - the self-answered exchange.
 * @param text - the answer the user wrote.
 */
export function resolveWithOwnAnswer(exchangeId: string, text: string) {
  pinAnswer('self', exchangeId, text, 'skipped');
}

/**
 * Records a resolution the user found outside the app, with no question of its own attached.
 * Nothing is sent to a model, so the note is shown as written.
 * @param topic - the (reactive) context being resolved.
 * @param note - what the user wrote after `@resolved`; may be empty.
 * @param exchangeId - the feed exchange carrying the note, when there is one.
 */
export function resolveManually(topic: Topic, note: string, exchangeId?: string) {
  topic.resolution = {
    source: 'manual',
    state: 'active',
    text: note,
    exchangeId,
    summary: null,
    summaryStatus: 'skipped',
    createdAt: Date.now(),
  };
  scheduleSave();
}

/** Pins an exchange's answer as its context's resolution; the context, if there was one. */
function pinAnswer(
  source: ResolutionSource,
  exchangeId: string,
  text: string,
  summaryStatus: SummaryStatus,
): Topic | undefined {
  const accepted = text.trim();
  const topic = topicOf(exchangeId);
  if (!topic || !accepted) return undefined;
  topic.resolution = {
    source,
    state: 'active',
    text: accepted,
    exchangeId,
    summary: null,
    summaryStatus,
    createdAt: Date.now(),
  };
  scheduleSave();
  return topic;
}

/** The context an exchange belongs to. */
function topicOf(exchangeId: string): Topic | undefined {
  return store.data.topics.find((t) => t.exchanges.some((e) => e.id === exchangeId));
}
