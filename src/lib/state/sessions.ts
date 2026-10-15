import type { Session, Topic } from '$lib/types';
import { newSession } from './defaults';
import { sessionName } from './session-name';
import { scheduleSave, store } from './store.svelte';
import { selectTopic } from './context';
import { sessionTopics } from './topics';

/**
 * All sessions, newest first, for the session picker.
 * @returns the sessions.
 */
export function sessionsNewestFirst(): Session[] {
  return [...store.data.sessions].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Every session's id and display name, newest first, for the session picker and dialog.
 * @returns the sessions to choose from.
 */
export function sessionChoices(): { id: string; name: string }[] {
  return sessionsNewestFirst().map((s) => ({
    id: s.id,
    name: sessionName(s, sessionTopics(s.id)),
  }));
}

/**
 * Whether the current session is empty, in which case starting another would do nothing.
 * @returns true when the current session has no contexts yet.
 */
export function sessionIsEmpty(): boolean {
  return sessionTopics().length === 0;
}

/**
 * Starts a new, empty session with a fresh context. The previous session's topics stay on
 * disk to return to later. Does nothing if the current session is already empty.
 */
export function startSession() {
  if (sessionIsEmpty()) return;
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

/**
 * Opens a context from any session, switching to its session first if need be. Search
 * results span every session, so opening one may mean leaving the current session.
 * @param topic - the context to open.
 */
export function openTopic(topic: Topic) {
  if (topic.sessionId !== store.data.currentSessionId) switchSession(topic.sessionId);
  selectTopic(topic.id);
}
