import { listen } from '@tauri-apps/api/event';

/** A streamed event from the backend, as emitted on the `chat-event` channel. */
export type ChatEvent =
  | { kind: 'commands'; commands: string[] }
  | { kind: 'text'; text: string }
  | { kind: 'thinking'; text: string }
  | { kind: 'tool'; name: string; detail: string }
  | { kind: 'done'; result: string | null; sessionId: string | null; isError: boolean }
  | { kind: 'error'; message: string };

type Handler = (event: ChatEvent) => void;

const handlers = new Map<string, Handler>();
let listening: Promise<unknown> | null = null;

/** Starts the single app-wide listener that routes events to their request's handler. */
function ensureListening(): Promise<unknown> {
  listening ??= listen<ChatEvent & { requestId: string }>('chat-event', ({ payload }) => {
    handlers.get(payload.requestId)?.(payload);
  });
  return listening;
}

/**
 * Routes every event for one request to a handler.
 * Await this before starting the request so no early events are missed.
 * @param requestId - the request to follow.
 * @param handler - called with each event, in order.
 * @returns a function that stops routing events to the handler.
 */
export async function subscribe(requestId: string, handler: Handler): Promise<() => void> {
  await ensureListening();
  handlers.set(requestId, handler);
  return () => handlers.delete(requestId);
}
