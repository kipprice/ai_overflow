import { extractTheme } from '$lib/ipc/harness';
import type { Topic } from '$lib/types';
import { scheduleSave, store } from './store.svelte';
import { isSlashCommand } from './transcript';

/**
 * Asks the theme model to label a topic from its first (non-slash) question, falling back to the
 * question itself on failure. If the user renames the topic while this runs, their name wins.
 * @param topic - the (reactive) topic to name.
 * @returns resolves once the topic has a theme.
 */
export async function nameTopic(topic: Topic) {
  const question = topic.exchanges.find((e) => !isSlashCommand(e.question))?.question ?? '';
  topic.themeStatus = 'pending';
  let theme: string;
  let failed = false;
  try {
    theme = await extractTheme(store.data.settings, question);
  } catch (err) {
    console.warn('Theme extraction failed', err);
    theme = fallbackTheme(question);
    failed = true;
  }
  if (topic.themeStatus !== 'pending') return;
  topic.theme = theme;
  topic.themeStatus = failed ? 'failed' : 'done';
  scheduleSave();
}

/**
 * Gives a topic a name chosen by the user. Blank names are ignored.
 * @param topic - the (reactive) topic to rename.
 * @param name - the new name.
 */
export function renameTopic(topic: Topic, name: string) {
  const theme = name.replace(/\s+/g, ' ').trim();
  if (!theme) return;
  topic.theme = theme;
  topic.themeStatus = 'done';
  scheduleSave();
}

/** Re-runs naming for topics left pending when the app last closed. */
export function resumePendingThemes() {
  store.data.topics.filter((t) => t.themeStatus === 'pending').forEach((t) => void nameTopic(t));
}

/** A readable label built from the question, used when the theme model fails. */
function fallbackTheme(question: string): string {
  const text = question.replace(/\s+/g, ' ').trim() || 'Untitled';
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}
