import { requestResolutionSummary } from '$lib/ipc/harness';
import type { Topic } from '$lib/types';
import { scheduleSave, store } from './store.svelte';

/**
 * Asks the helper model to put an accepted answer into one sentence, so the resolution reads
 * as a standalone note rather than as a fragment of a longer reply. Answers the user wrote
 * themselves are marked `skipped` and never reach a model.
 * @param topic - the (reactive) context whose resolution to summarise.
 * @returns resolves once the summary has arrived or failed.
 */
export async function summariseResolution(topic: Topic) {
  const resolution = topic.resolution;
  if (!resolution || resolution.summaryStatus === 'skipped') return;
  const stamp = resolution.createdAt;
  resolution.summaryStatus = 'pending';
  const question = acceptedQuestion(topic);
  try {
    const summary = await requestResolutionSummary(store.data.settings, question, resolution.text);
    if (!stillCurrent(topic, stamp)) return;
    resolution.summary = summary;
    resolution.summaryStatus = 'done';
  } catch (err) {
    console.warn('Resolution summary failed', err);
    if (!stillCurrent(topic, stamp)) return;
    resolution.summaryStatus = 'failed';
  }
  scheduleSave();
}

/** Retries summaries left pending when the app last closed. */
export function resumePendingSummaries() {
  store.data.topics
    .filter((t) => t.resolution?.summaryStatus === 'pending')
    .forEach((t) => void summariseResolution(t));
}

/** The question whose answer was accepted, which the summary is written against. */
function acceptedQuestion(topic: Topic): string {
  const id = topic.resolution?.exchangeId;
  return topic.exchanges.find((e) => e.id === id)?.question ?? '';
}

/** Whether the resolution we started summarising is still the context's resolution. */
function stillCurrent(topic: Topic, stamp: number): boolean {
  return topic.resolution?.createdAt === stamp;
}
