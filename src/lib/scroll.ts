/**
 * The DOM id of an exchange's block in the feed.
 * @param exchangeId - the exchange.
 * @returns the element id.
 */
export function exchangeElementId(exchangeId: string): string {
  return `exchange-${exchangeId}`;
}

/**
 * Scrolls the feed so an exchange's question sits at the top of the view, keeping the
 * message the user just sent in place while its response streams in below.
 * @param exchangeId - the exchange whose question to reveal.
 * @param smooth - animate the scroll (for new questions) or jump (when opening a context).
 */
export function scrollToExchange(exchangeId: string, smooth: boolean) {
  document
    .getElementById(exchangeElementId(exchangeId))
    ?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
}
