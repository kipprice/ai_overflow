import { tick } from 'svelte';
import { matchCommands, slashCommands } from '$lib/commands';
import { cancel, send, turn } from '$lib/state/chat.svelte';
import { clearNotice } from '$lib/state/notice.svelte';
import { store } from '$lib/state/store.svelte';

/** State and keyboard behaviour for the message composer. */
export class ComposerState {
  text = $state('');
  /** Highlighted slash-command suggestion. */
  selected = $state(0);
  /** Set when the user dismisses suggestions with Escape; reset on the next keystroke. */
  dismissed = $state(false);
  textarea: HTMLTextAreaElement | undefined = $state();

  suggestions = $derived.by(() => {
    if (this.dismissed) return [];
    const commands = slashCommands(store.data.settings.harness, store.data.claudeCommands);
    return matchCommands(this.text, commands);
  });

  /** Resets suggestion state, and clears any notice, after the user edits the text. */
  onInput() {
    this.dismissed = false;
    this.selected = 0;
    clearNotice();
  }

  /**
   * Handles keys inside the textarea: Enter sends, Shift+Enter inserts a newline, and the
   * arrow/Tab keys drive the slash-command menu.
   * @param event - the keydown event.
   */
  onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    const menuOpen = this.suggestions.length > 0;
    if (menuOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      this.moveSelection(event.key === 'ArrowDown' ? 1 : -1);
    } else if (menuOpen && event.key === 'Tab') {
      event.preventDefault();
      this.text = `/${this.suggestions[this.selected]} `;
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.submit(menuOpen ? `/${this.suggestions[this.selected]}` : this.text);
    }
  }

  /**
   * Handles Escape anywhere in the window: abandons a streaming reply and restores the
   * question for editing, or otherwise closes the command menu.
   * @param event - the keydown event.
   */
  onWindowKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (turn.requestId) {
      event.preventDefault();
      void this.restore(cancel());
    } else if (this.suggestions.length) {
      this.dismissed = true;
    }
  }

  /**
   * Sends text and clears the composer if it was accepted.
   * @param text - the text to send.
   */
  async submit(text: string) {
    if (await send(text)) this.text = '';
  }

  /** Puts a cancelled question back in the composer with the cursor at the end. */
  private async restore(question: string | null) {
    if (question === null) return;
    this.text = question;
    await tick();
    this.textarea?.focus();
    this.textarea?.setSelectionRange(question.length, question.length);
  }

  /** Moves the highlighted suggestion, wrapping around. */
  private moveSelection(step: number) {
    const count = this.suggestions.length;
    this.selected = (this.selected + step + count) % count;
  }
}
