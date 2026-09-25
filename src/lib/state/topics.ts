import type { Topic } from '$lib/types';
import { scheduleSave, store } from './store.svelte';

/**
 * Topics belonging to a session, newest first.
 * @param sessionId - the session to list; defaults to the current one.
 * @returns the session's topics.
 */
export function sessionTopics(sessionId = store.data.currentSessionId): Topic[] {
  return store.data.topics
    .filter((t) => t.sessionId === sessionId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * The context shown in the feed.
 * @returns the (reactive) current topic, or `undefined` for a fresh context.
 */
export function currentTopic(): Topic | undefined {
  return store.data.topics.find((t) => t.id === store.data.currentTopicId);
}

/**
 * Creates a topic in the current session and makes it the current context.
 * Called when the first question of a fresh context is sent.
 * @returns the (reactive) new topic.
 */
export function startTopic(): Topic {
  store.data.topics.push({
    id: crypto.randomUUID(),
    sessionId: store.data.currentSessionId,
    theme: null,
    themeStatus: 'pending',
    createdAt: Date.now(),
    exchanges: [],
  });
  const topic = store.data.topics[store.data.topics.length - 1];
  store.data.currentTopicId = topic.id;
  return topic;
}

/** Starts a fresh context (the /clear command); the next question begins a new topic. */
export function newContext() {
  store.data.currentTopicId = null;
  scheduleSave();
}

/**
 * Shows a context in the feed; the next question continues it.
 * @param topicId - the topic to open.
 */
export function selectTopic(topicId: string) {
  store.data.currentTopicId = topicId;
  scheduleSave();
}

/**
 * Permanently deletes a topic and all of its exchanges.
 * @param topicId - the topic to delete.
 */
export function deleteTopic(topicId: string) {
  store.data.topics = store.data.topics.filter((t) => t.id !== topicId);
  if (store.data.currentTopicId === topicId) store.data.currentTopicId = null;
  scheduleSave();
}
