import type { Topic } from '$lib/types';
import { scheduleSave, store } from './store.svelte';

/** Starts a fresh context (the /clear command); the next question begins a new topic. */
export function newContext() {
  store.data.currentTopicId = null;
  store.data.forkFromTopicId = null;
  scheduleSave();
}

/**
 * Whether the feed shows a fresh context, waiting for a new question (after /clear, the Ask
 * Question button, or a follow-up being set up).
 * @returns true when no context is open.
 */
export function isFreshContext(): boolean {
  return store.data.currentTopicId === null;
}

/**
 * Leaves a resolved question settled and sets up a follow-up that continues from it. The
 * next question opens a new context carrying this one's conversation.
 * @param topic - the context to continue from.
 */
export function forkContext(topic: Topic) {
  store.data.currentTopicId = null;
  store.data.forkFromTopicId = topic.id;
  scheduleSave();
}

/**
 * Shows a context in the feed; the next question continues it. Opening a context is a choice
 * of what to continue, so it also disarms a fork left pending — otherwise the next question
 * would quietly inherit an unrelated context's session and history.
 * @param topicId - the topic to open.
 */
export function selectTopic(topicId: string) {
  store.data.currentTopicId = topicId;
  store.data.forkFromTopicId = null;
  scheduleSave();
}
