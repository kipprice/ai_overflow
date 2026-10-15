import { tick } from 'svelte';
import { cancel, send, turn } from '$lib/state/chat.svelte';
import { clearNotice } from '$lib/state/notice.svelte';
import { SuggestMenu } from './suggest-menu.svelte';

/** State and keyboard behaviour for the message composer. */
export class ComposerState {
  text = $state('');
  /** Caret position, which decides the word being completed. */
  caret = $state(0);
  textarea: HTMLTextAreaElement | undefined = $state();
  menu = new SuggestMenu({
    view: () => ({ text: this.text, caret: this.caret }),
    submit: (text) => this.submit(text),
    write: (text, caret) => this.write(text, caret),
  });

  /** Resets the menu, and clears any notice, after the user edits the text. */
  onInput() {
    this.syncCaret();
    this.menu.reset();
    clearNotice();
  }

  /** Records where the caret is, after typing, clicking or moving it with the keyboard. */
  syncCaret() {
    this.caret = this.textarea?.selectionStart ?? this.text.length;
  }

  /**
   * Handles keys inside the textarea: Enter sends, Shift+Enter inserts a newline, and the
   * arrow/Tab keys drive the suggestion menu.
   * @param event - the keydown event.
   */
  onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    const menuOpen = this.menu.trigger !== null;
    if (menuOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      this.menu.move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (menuOpen && event.key === 'Tab') {
      event.preventDefault();
      void this.menu.complete();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.menu.enter();
    }
  }

  /**
   * Handles Escape anywhere in the window: abandons a streaming reply and restores the
   * question for editing, or otherwise closes the suggestion menu.
   * @param event - the keydown event.
   */
  onWindowKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (turn.requestId) {
      event.preventDefault();
      const question = cancel();
      if (question !== null) void this.write(question, question.length);
    } else if (this.menu.trigger) {
      this.menu.dismissed = true;
    }
  }

  /**
   * Sends text and clears the composer if it was accepted.
   * @param text - the text to send.
   * @returns resolves once the text has been handled.
   */
  async submit(text: string) {
    if (await send(text)) this.text = '';
  }

  /**
   * Replaces the text and focuses the textarea with the caret at a position, once rendered.
   * Used to complete a suggestion, and to put a cancelled question back for editing.
   * @param text - the new text.
   * @param caret - where the caret goes.
   * @returns resolves once the caret is in place.
   */
  async write(text: string, caret: number) {
    this.text = text;
    await tick();
    this.textarea?.focus();
    this.textarea?.setSelectionRange(caret, caret);
    this.caret = caret;
  }
}
