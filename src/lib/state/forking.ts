import type { Exchange, Topic } from '$lib/types';
import { store } from './store.svelte';

/**
 * The context a new question should continue, if the user forked a resolved one. Forking
 * doesn't create the topic straight away, so a fork the user never follows up on leaves no
 * empty context behind.
 * @returns the context to continue, or `undefined` for an ordinary fresh question.
 */
export function pendingForkParent(): Topic | undefined {
  return findTopic(store.data.forkFromTopicId);
}

/**
 * The context a topic was forked from.
 * @param topic - the topic to look up, if there is one.
 * @returns its parent context, or `undefined` if it wasn't forked.
 */
export function parentOf(topic?: Topic): Topic | undefined {
  return findTopic(topic?.forkedFromId);
}

/**
 * Every exchange that makes up a topic's conversation, inherited ones first. A fork carries
 * its parent's history so a follow-up question reads as a continuation to the model, not as
 * the opening of an unrelated thread.
 * @param topic - the topic whose conversation to collect.
 * @returns the exchanges, oldest first.
 */
export function contextExchanges(topic: Topic): Exchange[] {
  const parent = parentOf(topic);
  return parent ? [...contextExchanges(parent), ...topic.exchanges] : [...topic.exchanges];
}

/** Looks up a topic by id, tolerating a missing or deleted one. */
function findTopic(id?: string | null): Topic | undefined {
  return id ? store.data.topics.find((t) => t.id === id) : undefined;
}
