import type { ChatEvent } from '$lib/ipc/events';
import type { Exchange, Topic } from '$lib/types';
import { store } from './store.svelte';

/**
 * Applies one streamed event to the exchange being answered.
 * The Claude session id is only adopted when the turn completes, so a cancelled turn
 * never becomes part of the context.
 * @param event - the streamed event.
 * @param exchange - the (reactive) exchange receiving output.
 * @param topic - the (reactive) topic it belongs to.
 * @returns true once the turn has finished (successfully or not).
 */
export function applyEvent(event: ChatEvent, exchange: Exchange, topic: Topic): boolean {
  switch (event.kind) {
    case 'text':
      exchange.answer += event.text;
      return false;
    case 'thinking':
      exchange.thinking += event.text;
      return false;
    case 'tool':
      exchange.tools.push({ name: event.name, detail: event.detail });
      return false;
    case 'commands':
      store.data.claudeCommands = event.commands;
      return false;
    case 'done':
      finishExchange(event, exchange, topic);
      return true;
    case 'error':
      exchange.status = 'error';
      exchange.error = event.message;
      return true;
  }
}

/** Records the final result: slash command output, errors and the new Claude session. */
function finishExchange(event: Extract<ChatEvent, { kind: 'done' }>, exchange: Exchange, topic: Topic) {
  if (!exchange.answer.trim() && event.result) exchange.answer = event.result;
  if (event.isError) {
    exchange.status = 'error';
    exchange.error = event.result ?? 'The model reported an error';
    return;
  }
  exchange.status = 'done';
  if (event.sessionId) topic.claudeSessionId = event.sessionId;
}
