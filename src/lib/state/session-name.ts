import type { Session, Topic } from '$lib/types';

const THEMES_IN_NAME = 3;

/**
 * Names a session after its date and most common themes, e.g.
 * "Sep 19, 10:42 AM · Rust Lifetimes, Tauri IPC".
 * @param session - the session to name.
 * @param topics - that session's topics.
 * @returns the display name.
 */
export function sessionName(session: Session, topics: Topic[]): string {
  const date = new Date(session.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const themes = topThemes(topics);
  return themes.length ? `${date} · ${themes.join(', ')}` : `${date} · New session`;
}

/**
 * The most frequent themes (case-insensitive), ties broken by how much was discussed.
 * @param topics - the topics to rank.
 * @returns up to three theme labels.
 */
function topThemes(topics: Topic[]): string[] {
  const tally = new Map<string, { label: string; count: number; size: number }>();
  for (const topic of topics) {
    if (!topic.theme) continue;
    const key = topic.theme.toLowerCase();
    const entry = tally.get(key) ?? { label: topic.theme, count: 0, size: 0 };
    entry.count += 1;
    entry.size += topic.exchanges.length;
    tally.set(key, entry);
  }
  return [...tally.values()]
    .sort((a, b) => b.count - a.count || b.size - a.size)
    .slice(0, THEMES_IN_NAME)
    .map((e) => e.label);
}
