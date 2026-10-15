/** One entry in a suggestion popup. */
export interface SuggestItem {
  /** The text picking it writes in, e.g. `/compact`, `#rust` or `@resolved`. */
  value: string;
  /** A short note shown beside it, such as a tag's facet. */
  hint?: string;
}

/**
 * Moves a highlighted index through a list, wrapping at either end, as arrow keys do in a
 * suggestion popup.
 * @param index - the highlighted index.
 * @param step - how far to move: 1 for down, -1 for up.
 * @param count - how many items the list has.
 * @returns the new index; 0 for an empty list.
 */
export function wrapIndex(index: number, step: number, count: number): number {
  return count === 0 ? 0 : (index + step + count) % count;
}
