/**
 * Copies text to the system clipboard, so a highlighted snippet (a code block, say) can be
 * taken out of an answer without leaving the feed.
 * @param text - the text to copy.
 * @returns resolves once copied; rejects if the clipboard is unavailable.
 */
export function copyText(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
