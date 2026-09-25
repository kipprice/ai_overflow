import { subscribe } from '$lib/ipc/events';
import { cancelRequest, claudeSend, ollamaSend } from '$lib/ipc/harness';
import { ollamaThink } from '$lib/models';
import type { Exchange, Topic } from '$lib/types';
import { applyEvent } from './apply-event';
import { claudeCwd, scheduleSave, store } from './store.svelte';
import { nameTopic } from './naming';
import { currentTopic, deleteTopic, newContext, startTopic } from './topics';
import { claudePrompt, isFirstQuestion, ollamaMessages } from './transcript';

/** The turn currently streaming, if any. */
export const turn = $state({ requestId: null as string | null });

let current: { exchange: Exchange; topic: Topic; unsubscribe: () => void } | null = null;

/**
 * Sends the composer's text: `/clear` starts a new context, anything else (including other
 * slash commands) goes to the selected harness. The first real question of a context also
 * kicks off naming its theme.
 * @param text - the composer text.
 * @returns true if the text was accepted and the composer should be emptied.
 */
export async function send(text: string): Promise<boolean> {
  const question = text.trim();
  if (!question || turn.requestId) return false;
  if (question === '/clear') {
    newContext();
    return true;
  }
  const topic = currentTopic() ?? startTopic();
  const prior = [...topic.exchanges];
  topic.exchanges.push(newExchange(question));
  if (isFirstQuestion(prior, question)) void nameTopic(topic);
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
  if (topic.exchanges.length === 0) deleteTopic(topic.id);
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

/** Creates the exchange record for a new question using the current settings. */
function newExchange(question: string): Exchange {
  const s = store.data.settings;
  const isClaude = s.harness === 'claude';
  return {
    id: crypto.randomUUID(),
    question,
    answer: '',
    thinking: '',
    tools: [],
    harness: s.harness,
    model: isClaude ? s.claudeModel : s.ollamaModel,
    effort: isClaude ? s.claudeEffort : s.ollamaEffort,
    createdAt: Date.now(),
    status: 'streaming',
  };
}
