/**
 * The DOM id of an exchange's response block in the feed.
 * @param exchangeId - the exchange.
 * @returns the element id.
 */
export function responseElementId(exchangeId: string): string {
  return `response-${exchangeId}`;
}

/**
 * Scrolls the feed so the top of a response sits at the top of the view, keeping the
 * beginning of the answer in place while the rest streams in below.
 * @param exchangeId - the exchange whose response to reveal.
 * @param smooth - animate the scroll (for new answers) or jump (when opening a context).
 */
export function scrollToResponse(exchangeId: string, smooth: boolean) {
  document
    .getElementById(responseElementId(exchangeId))
    ?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
}
