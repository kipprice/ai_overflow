import { suggestTags } from '$lib/tags/vocabulary';
import type { SuggestItem } from '../common/suggest';

/**
 * Tags in use that match what is typed, as entries for a suggestion menu: written with their
 * `#`, and noted with their facet and how many contexts carry them.
 * @param query - the label typed so far.
 * @param exclude - labels to leave out, such as those the context already has.
 * @returns the menu entries.
 */
export function tagSuggestions(query: string, exclude: string[]): SuggestItem[] {
  return suggestTags(query, exclude).map((e) => ({ value: `#${e.label}`, hint: `${e.facet} · ${e.count}` }));
}
