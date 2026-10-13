import { subscribe } from '$lib/ipc/events';
import { cancelRequest, claudeSend, ollamaSend } from '$lib/ipc/harness';
import { ollamaThink } from '$lib/models';
import type { Exchange, Topic } from '$lib/types';
import { applyEvent } from './apply-event';
import { contextExchanges } from './forking';
import { runLocalCommand } from './local-commands';
import { nameTopic } from './naming';
import { newExchange } from './new-exchange';
import { discardResolution } from './resolution-state';
import { claudeCwd, scheduleSave, store } from './store.svelte';
import { currentTopic, deleteTopic, startTopic } from './topics';
import { claudePrompt, isFirstQuestion, ollamaMessages } from './transcript';

/** The turn currently streaming, if any. */
export const turn = $state({ requestId: null as string | null });

let current: { exchange: Exchange; topic: Topic; unsubscribe: () => void } | null = null;

/**
 * Sends the composer's text. Text the app handles itself (`/clear`, `@resolved`) never
 * reaches a harness; anything else, including other slash commands, goes to the selected
 * one. The first real question of a context also kicks off naming its theme.
 * @param text - the composer text.
 * @returns true if the text was accepted and the composer should be emptied.
 */
export async function send(text: string): Promise<boolean> {
  const question = text.trim();
  if (!question || turn.requestId) return false;
  const local = runLocalCommand(question);
  if (local !== 'none') return local === 'accepted';
  const topic = currentTopic() ?? startTopic();
  // The theme is named from this context's own first question, but the model is sent the
  // whole conversation, which for a fork reaches back into the context it continues.
  const own = [...topic.exchanges];
  const prior = contextExchanges(topic);
  topic.exchanges.push(newExchange(question));
  if (isFirstQuestion(own, question)) void nameTopic(topic);
  const exchange = topic.exchanges[topic.exchanges.length - 1];
  const requestId = crypto.randomUUID();
  turn.requestId = requestId;
  const unsubscribe = await subscribe(requestId, (event) => {
    if (applyEvent(event, exchange, topic)) finishTurn();
  });
  current = { exchange, topic, unsubscribe };
  startTurn(requestId, question, prior, topic).catch((err) => {
    applyEvent({ kind: 'error', message: String(err) }, exchange, topic);
    finishTurn();
  });
  return true;
}

/**
 * Abandons the streaming turn (Escape): stops generation and removes the exchange (and its
 * context, if that was the context's only question).
 * @returns the question that was sent, to restore into the composer; `null` if idle.
 */
export function cancel(): string | null {
  if (!turn.requestId || !current) return null;
  const { exchange, topic } = current;
  void cancelRequest(turn.requestId);
  finishTurn();
  topic.exchanges = topic.exchanges.filter((e) => e.id !== exchange.id);
  // An answer accepted from the part that had streamed goes with the exchange it came from;
  // left behind, it would hold the context resolved by an answer no longer in the feed.
  if (topic.resolution?.exchangeId === exchange.id) discardResolution(topic);
  if (topic.exchanges.length === 0) {
    // Put a fork back in play, so retyping the question still continues what it came from.
    if (topic.forkedFromId) store.data.forkFromTopicId = topic.forkedFromId;
    deleteTopic(topic.id);
  }
  scheduleSave();
  return exchange.question;
}

/** Dispatches the turn to the selected harness. */
function startTurn(requestId: string, question: string, prior: Exchange[], topic: Topic) {
  const settings = store.data.settings;
  if (settings.harness === 'ollama') {
    const think = ollamaThink(settings.ollamaEffort);
    return ollamaSend(requestId, settings, ollamaMessages(prior, question), think);
  }
  const prompt = claudePrompt(prior, question);
  return claudeSend(requestId, prompt, settings, claudeCwd(), topic.claudeSessionId);
}

/** Stops listening for the current turn and persists the result. */
function finishTurn() {
  current?.unsubscribe();
  current = null;
  turn.requestId = null;
  scheduleSave();
}
