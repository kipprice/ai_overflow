/**
 * The composer's trigger characters, and what each suggests: `/` slash commands (a whole
 * message on its own), `#` the tags already in use, and `@` the `@resolved` marker. A `#` or
 * `@` triggers anywhere a word starts, so tags can be added mid-question.
 */

import { matchCommands, slashCommands } from '$lib/commands';
import { RESOLVED_MARKER } from '$lib/state/resolved-marker';
import { store } from '$lib/state/store.svelte';
import { currentTopic } from '$lib/state/topics';
import type { SuggestItem } from '../common/suggest';
import { tagSuggestions } from '../tags/tag-suggestions';

/** Suggestions for the word being typed, and where in the text that word is. */
export interface Trigger {
  items: SuggestItem[];
  /** `submit` sends the pick straight away (slash commands); `insert` writes it into the text. */
  mode: 'submit' | 'insert';
  /** Where the word being completed starts in the text. */
  start: number;
  /** Where it ends: the caret. */
  end: number;
}

/**
 * Finds what to suggest for the text being typed.
 * @param text - the composer text.
 * @param caret - where the caret is in it.
 * @returns the suggestions, or `null` when nothing is being triggered.
 */
export function findTrigger(text: string, caret: number): Trigger | null {
  return slashTrigger(text) ?? wordTrigger(text, caret);
}

/**
 * Writes a suggestion in place of the word it completes, followed by a space to type on from.
 * @param text - the composer text.
 * @param trigger - the trigger the suggestion came from.
 * @param item - the suggestion picked.
 * @returns the new text, and where the caret belongs in it.
 */
export function completeWord(text: string, trigger: Trigger, item: SuggestItem) {
  const value = `${item.value} `;
  return {
    text: text.slice(0, trigger.start) + value + text.slice(trigger.end),
    caret: trigger.start + value.length,
  };
}

/** Slash commands, suggested while the whole message is a lone `/word`. */
function slashTrigger(text: string): Trigger | null {
  const commands = slashCommands(store.data.settings.harness, store.data.claudeCommands);
  const items = matchCommands(text, commands).map((c) => ({ value: `/${c}` }));
  return items.length ? { items, mode: 'submit', start: 0, end: text.length } : null;
}

/** Tags or `@resolved`, suggested for a `#` or `@` word ending at the caret. */
function wordTrigger(text: string, caret: number): Trigger | null {
  // Editing the middle of a word is not a moment to complete it.
  if (/^\S/.test(text.slice(caret))) return null;
  const before = text.slice(0, caret);
  const start = before.search(/\S*$/);
  const word = before.slice(start);
  const items = word.startsWith('#') ? tagItems(word.slice(1)) : markerItems(word);
  return items.length ? { items, mode: 'insert', start, end: caret } : null;
}

/** Tags in use that match what follows the `#`, leaving out those the context already has. */
function tagItems(query: string): SuggestItem[] {
  return tagSuggestions(query, currentTopic()?.tags.map((t) => t.label) ?? []);
}

/** `@resolved`, while the word typed so far could still become it. */
function markerItems(word: string): SuggestItem[] {
  if (!word.startsWith('@') || !RESOLVED_MARKER.startsWith(word.toLowerCase())) return [];
  return [{ value: RESOLVED_MARKER, hint: 'answer it yourself' }];
}
