import type { Session } from '$lib/types';
import { newSession } from './defaults';
import { scheduleSave, store } from './store.svelte';
import { sessionTopics } from './topics';

/**
 * All sessions, newest first, for the session picker.
 * @returns the sessions.
 */
export function sessionsNewestFirst(): Session[] {
  return [...store.data.sessions].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Starts a new, empty session with a fresh context. The previous session's topics stay on
 * disk to return to later. Does nothing if the current session is already empty.
 */
export function startSession() {
  if (sessionTopics().length === 0) return;
  const session = newSession();
  store.data.sessions.push(session);
  store.data.currentSessionId = session.id;
  store.data.currentTopicId = null;
  scheduleSave();
}

/**
 * Switches the sidebar to another session and opens its most recent context.
 * @param sessionId - the session to show.
 */
export function switchSession(sessionId: string) {
  store.data.currentSessionId = sessionId;
  store.data.currentTopicId = sessionTopics(sessionId)[0]?.id ?? null;
  scheduleSave();
}
