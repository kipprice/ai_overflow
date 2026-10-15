import { normalizeLabel } from '$lib/tags/normalize';
import { type SuggestItem, wrapIndex } from '../common/suggest';
import { tagSuggestions } from './tag-suggestions';

/**
 * State for the inline "add a tag" field. Tags already in use are offered first, so typing
 * converges on the feed's own vocabulary; what was typed is offered last, as a new tag.
 */
export class TagInputState {
  value = $state('');
  selected = $state(0);
  #exclude: () => string[];

  items: SuggestItem[] = $derived.by(() => {
    const existing = tagSuggestions(this.value, this.#exclude());
    const typed = normalizeLabel(this.value);
    const known = existing.some((i) => i.value === `#${typed}`) || this.#exclude().includes(typed);
    return typed && !known ? [...existing, { value: `#${typed}`, hint: 'new tag' }] : existing;
  });

  /**
   * Creates the field's state.
   * @param exclude - reads the labels to leave out: those the context already has.
   */
  constructor(exclude: () => string[]) {
    this.#exclude = exclude;
  }

  /**
   * Handles keys in the field: arrows move the highlight, Enter adds the highlighted tag and
   * stays open for another, and Escape closes the field.
   * @param event - the keydown event.
   * @param onAdd - called with the label to add.
   * @param onClose - called when the field should close.
   */
  onKeydown(event: KeyboardEvent, onAdd: (label: string) => void, onClose: () => void) {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.selected = wrapIndex(this.selected, event.key === 'ArrowDown' ? 1 : -1, this.items.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.items[this.selected];
      if (item) this.add(item, onAdd);
    } else if (event.key === 'Escape') {
      // Kept from the window, where Escape would otherwise stop a streaming reply.
      event.stopPropagation();
      onClose();
    }
  }

  /**
   * Adds a suggestion's tag and empties the field for the next one.
   * @param item - the suggestion picked.
   * @param onAdd - called with the label to add.
   */
  add(item: SuggestItem, onAdd: (label: string) => void) {
    onAdd(item.value.slice(1));
    this.value = '';
    this.selected = 0;
  }
}
