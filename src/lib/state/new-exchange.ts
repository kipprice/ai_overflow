import type { Exchange } from '$lib/types';
import { store } from './store.svelte';

/**
 * Creates the record for a new question, stamped with the settings in force when it was
 * asked, so the feed still shows which model answered after the settings change.
 * @param question - the text the user sent.
 * @returns the exchange to append to the context.
 */
export function newExchange(question: string): Exchange {
  const s = store.data.settings;
  const isClaude = s.harness === 'claude';
  return {
    ...blankExchange(question),
    model: isClaude ? s.claudeModel : s.ollamaModel,
    effort: isClaude ? s.claudeEffort : s.ollamaEffort,
  };
}

/**
 * Creates the record for a question the user answered themselves in the message that asked
 * it (`question @resolved answer`). It is finished the moment it is made: no model is asked,
 * so there is no model to stamp it with and nothing to stream in.
 * @param question - the text before the `@resolved` marker.
 * @param answer - the text after it.
 * @returns the exchange to append to the context.
 */
export function selfAnsweredExchange(question: string, answer: string): Exchange {
  return { ...blankExchange(question), answer, status: 'done', selfAnswered: true };
}

/** The fields every exchange starts with, whoever ends up answering it. */
function blankExchange(question: string): Exchange {
  return {
    id: crypto.randomUUID(),
    question,
    answer: '',
    thinking: '',
    tools: [],
    // Which harness the context was on; a self-answered exchange reached none of them, but
    // the stamp still says whose transcript it has to be replayed into.
    harness: store.data.settings.harness,
    model: '',
    effort: '',
    createdAt: Date.now(),
    status: 'streaming',
  };
}
