/**
 * Deciding whether a context answers a search. Every tag and every word must match, so each
 * term the user adds narrows the results.
 */

import type { Topic } from '$lib/types';
import type { SearchQuery } from './query';

/**
 * Whether a context matches a search: it carries every tag asked for, and its text contains
 * every word.
 * @param topic - the context to test.
 * @param query - the parsed search.
 * @returns true if the context should be listed.
 */
export function matchesTopic(topic: Topic, query: SearchQuery): boolean {
  const labels = topic.tags.map((t) => t.label);
  if (!query.tags.every((tag) => labels.includes(tag))) return false;
  if (query.words.length === 0) return true;
  const text = searchableText(topic);
  return query.words.every((word) => text.includes(word));
}

/**
 * Everything about a context a word can match, lowercased: its theme, tags, questions,
 * answers and resolution. Thinking and tool calls are left out; they are the model's
 * working, not what the context is about.
 */
function searchableText(topic: Topic): string {
  const parts = [
    topic.theme ?? '',
    ...topic.tags.map((t) => t.label),
    ...topic.exchanges.flatMap((e) => [e.question, e.answer]),
    topic.resolution?.text ?? '',
    topic.resolution?.summary ?? '',
  ];
  return parts.join('\n').toLowerCase();
}
