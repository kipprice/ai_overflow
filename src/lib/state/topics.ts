import type { Topic } from '$lib/types';
import { pendingForkParent } from './forking';
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
 * Creates a topic in the current session and makes it the current context. Called when the
 * first question of a fresh context is sent. A pending fork is consumed here, so the new
 * topic inherits the Claude session and history of the context it continues.
 * @returns the (reactive) new topic.
 */
export function startTopic(): Topic {
  const parent = pendingForkParent();
  store.data.forkFromTopicId = null;
  store.data.topics.push({
    id: crypto.randomUUID(),
    sessionId: store.data.currentSessionId,
    theme: null,
    themeStatus: 'pending',
    createdAt: Date.now(),
    exchanges: [],
    claudeSessionId: parent?.claudeSessionId,
    forkedFromId: parent?.id,
  });
  const topic = store.data.topics[store.data.topics.length - 1];
  store.data.currentTopicId = topic.id;
  return topic;
}

/** Starts a fresh context (the /clear command); the next question begins a new topic. */
export function newContext() {
  store.data.currentTopicId = null;
  store.data.forkFromTopicId = null;
  scheduleSave();
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

/**
 * Permanently deletes a topic and all of its exchanges. A fork pending from this topic goes
 * with it, since there is no longer a conversation for it to continue; one pending from any
 * other topic is left armed.
 * @param topicId - the topic to delete.
 */
export function deleteTopic(topicId: string) {
  store.data.topics = store.data.topics.filter((t) => t.id !== topicId);
  if (store.data.currentTopicId === topicId) store.data.currentTopicId = null;
  if (store.data.forkFromTopicId === topicId) store.data.forkFromTopicId = null;
  scheduleSave();
}
