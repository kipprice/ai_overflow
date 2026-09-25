import type { AppData, Session, Settings } from '$lib/types';

const DEFAULT_SETTINGS: Settings = {
  appearance: 'system',
  harness: 'claude',
  claudeModel: 'claude-opus-5',
  claudeEffort: '',
  ollamaModel: '',
  ollamaEffort: '',
  themeHarness: 'claude',
  themeClaudeModel: 'claude-haiku-4-5',
  themeOllamaModel: '',
  ollamaUrl: 'http://localhost:11434',
  claudePath: '',
  claudeCwd: '',
};

/**
 * Creates an empty session.
 * @returns a new session stamped with the current time.
 */
export function newSession(): Session {
  return { id: crypto.randomUUID(), createdAt: Date.now() };
}

/**
 * Builds the data for a first launch: default settings and one empty session.
 * @returns fresh app data.
 */
export function freshData(): AppData {
  const session = newSession();
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    sessions: [session],
    topics: [],
    currentSessionId: session.id,
    currentTopicId: null,
    claudeCommands: [],
  };
}

/**
 * Parses saved data, filling in settings added since it was saved, queueing unnamed
 * contexts for naming, and marking answers still streaming when the app closed as interrupted.
 * @param json - the saved JSON, or `null` on first launch.
 * @returns usable app data.
 */
export function restoreData(json: string | null): AppData {
  if (!json) return freshData();
  const data = JSON.parse(json) as AppData;
  data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
  data.currentTopicId ??= null;
  for (const topic of data.topics) {
    // Contexts saved before naming moved to the first question have no theme yet.
    if (!topic.theme && topic.themeStatus !== 'failed') topic.themeStatus = 'pending';
  }
  for (const exchange of data.topics.flatMap((t) => t.exchanges)) {
    if (exchange.status === 'streaming') {
      exchange.status = 'error';
      exchange.error = 'Interrupted when the app closed';
    }
  }
  if (!data.sessions.some((s) => s.id === data.currentSessionId)) {
    const session = newSession();
    data.sessions.push(session);
    data.currentSessionId = session.id;
  }
  return data;
}
