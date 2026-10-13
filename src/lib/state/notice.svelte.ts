/**
 * A one-line message shown under the composer: confirmation that something happened, or why
 * a message was not sent. It replaces the keyboard hints until the user types again.
 */
export const notice = $state({ text: '' });

/**
 * Shows a message under the composer.
 * @param text - the message to show.
 */
export function setNotice(text: string) {
  notice.text = text;
}

/** Hides the current message, restoring the keyboard hints. */
export function clearNotice() {
  notice.text = '';
}
