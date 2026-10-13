/**
 * Answers the user writes themselves with `@resolved`: a question answered in the same
 * message, or a note on the question already open. Neither is sent to a harness, and neither
 * answer is run through a model — only the context's theme is, since that is about the
 * question. Both join the feed, so the conversation keeps the whole story.
 */

import type { Exchange, Topic } from '$lib/types';
import { nameTopic } from './naming';
import { selfAnsweredExchange } from './new-exchange';
import { resolveManually, resolveWithOwnAnswer } from './resolutions';
import { scheduleSave } from './store.svelte';
import { currentTopic, startTopic } from './topics';
import { isFirstQuestion } from './transcript';

/**
 * Posts a question with the answer the user already has, and marks its context resolved.
 * @param question - the text before the `@resolved` marker.
 * @param answer - the text after it.
 */
export function selfAnswer(question: string, answer: string) {
  const topic = currentTopic() ?? startTopic();
  const own = [...topic.exchanges];
  const exchange = appendOwnAnswer(topic, question, answer);
  if (isFirstQuestion(own, question)) void nameTopic(topic);
  resolveWithOwnAnswer(exchange.id, answer);
}

/**
 * Records a note on a context as what resolved it. The note answers the question already in
 * the feed, so it is posted there as an answer of the user's own; a bare `@resolved` has
 * nothing to post and only settles the question.
 *
 * A context with no question of its own — one opened by the note itself — is still named, and
 * the note is all there is to name it from.
 * @param topic - the (reactive) context being resolved.
 * @param note - what the user wrote after `@resolved`; may be empty.
 */
export function manualAnswer(topic: Topic, note: string) {
  const openedByTheNote = topic.exchanges.length === 0;
  const exchange = note ? appendOwnAnswer(topic, '', note) : undefined;
  resolveManually(topic, note, exchange?.id);
  if (exchange && openedByTheNote) void nameTopic(topic);
}

/** Adds a finished, user-written exchange to the end of a context. */
function appendOwnAnswer(topic: Topic, question: string, answer: string): Exchange {
  topic.exchanges.push(selfAnsweredExchange(question, answer));
  scheduleSave();
  return topic.exchanges[topic.exchanges.length - 1];
}
