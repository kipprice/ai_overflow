import { type SuggestItem, wrapIndex } from '../common/suggest';
import { completeWord, findTrigger, type Trigger } from './triggers';

/** What the suggestion menu needs from the composer it belongs to. */
export interface MenuHost {
  /** The composer's text and caret, which decide what is suggested. */
  view(): { text: string; caret: number };
  /** Sends text, as Enter would. */
  submit(text: string): Promise<void>;
  /** Replaces the composer's text and puts the caret at a position. */
  write(text: string, caret: number): Promise<void>;
}

/**
 * The composer's suggestion menu: what it offers for the word being typed, which entry is
 * highlighted, whether the user has dismissed it, and what picking an entry does.
 */
export class SuggestMenu {
  selected = $state(0);
  /** Set when the user dismisses the menu with Escape; reset on the next keystroke. */
  dismissed = $state(false);
  #host: MenuHost;

  trigger: Trigger | null = $derived.by(() => {
    if (this.dismissed) return null;
    const { text, caret } = this.#host.view();
    return findTrigger(text, caret);
  });

  /**
   * Creates the menu for a composer.
   * @param host - the composer the menu reads from and writes to.
   */
  constructor(host: MenuHost) {
    this.#host = host;
  }

  /**
   * Moves the highlight, wrapping around.
   * @param step - 1 to move down, -1 to move up.
   */
  move(step: number) {
    this.selected = wrapIndex(this.selected, step, this.trigger?.items.length ?? 0);
  }

  /** Re-opens the menu at its first entry, after the user edits the text. */
  reset() {
    this.selected = 0;
    this.dismissed = false;
  }

  /**
   * Uses a suggestion, as clicking it does: sends a slash command, or writes in a tag or marker.
   * @param item - the suggestion picked.
   * @returns resolves once it has been sent or written in.
   */
  async pick(item: SuggestItem) {
    if (this.trigger?.mode === 'submit') await this.#host.submit(item.value);
    else await this.complete(item);
  }

  /**
   * Writes a suggestion in place of the word it completes, as Tab does.
   * @param item - the suggestion to write in; defaults to the highlighted one.
   * @returns resolves once the text has been rewritten.
   */
  async complete(item = this.trigger?.items[this.selected]) {
    if (!this.trigger || !item) return;
    const completed = completeWord(this.#host.view().text, this.trigger, item);
    this.reset();
    await this.#host.write(completed.text, completed.caret);
  }

  /**
   * Enter: picks the highlighted suggestion, or sends the text when there is none to pick or
   * the word is already typed out in full.
   * @returns resolves once the text has been sent or rewritten.
   */
  async enter() {
    const { text } = this.#host.view();
    const trigger = this.trigger;
    const item = trigger?.items[this.selected];
    if (!trigger || !item || item.value === text.slice(trigger.start, trigger.end)) {
      return this.#host.submit(text);
    }
    return this.pick(item);
  }
}
