import { copyText } from '$lib/clipboard';
import { setNotice } from './notice.svelte';
import { resolveWithAnswer } from './resolutions';

/** Attribute tagging the element that wraps one answer (set in `ExchangeResponse.svelte`). */
export const ANSWER_ATTR = 'data-answer-of';

/** How close to the top of the window the floating actions may sit, in pixels. */
const MIN_TOP_PX = 48;

/** An empty selection: nothing highlighted, so no actions are offered. */
const NONE = { exchangeId: '', text: '', left: 0, top: 0 };

/** Text the user has highlighted inside an answer, and where to float its quick actions. */
export const answerSelection = $state({ ...NONE });

/**
 * Starts tracking highlights inside answers, so the feed can offer quick actions for them.
 * Scrolling is watched too (in the capture phase, since scroll events don't bubble) to keep
 * the floating actions over the text they belong to.
 * @returns a function that stops tracking.
 */
export function watchAnswerSelection(): () => void {
  const onChange = () => Object.assign(answerSelection, readSelection());
  // Only worth measuring on scroll when something is actually highlighted.
  const onScroll = () => answerSelection.text && onChange();
  document.addEventListener('selectionchange', onChange);
  document.addEventListener('scroll', onScroll, true);
  return () => {
    document.removeEventListener('selectionchange', onChange);
    document.removeEventListener('scroll', onScroll, true);
  };
}

/** Drops the highlight and its actions, once the user has acted on it. */
export function clearAnswerSelection() {
  Object.assign(answerSelection, NONE);
  window.getSelection()?.removeAllRanges();
}

/** Puts the highlighted snippet on the clipboard, confirming it under the composer. */
export function copyAnswerSelection() {
  const text = answerSelection.text;
  clearAnswerSelection();
  copyText(text).then(
    () => setNotice('Copied to the clipboard.'),
    (err) => setNotice(`Could not copy: ${err}`),
  );
}

/** Accepts the highlighted text as what resolved its question. */
export function resolveAnswerSelection() {
  resolveWithAnswer(answerSelection.exchangeId, answerSelection.text);
  clearAnswerSelection();
}

/** Reads the window selection, keeping it only if it lies inside a single answer. */
function readSelection(): typeof NONE {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return NONE;
  const text = selection.toString().trim();
  const range = selection.getRangeAt(0);
  const exchangeId = answerIdOf(range.commonAncestorContainer);
  if (!text || !exchangeId) return NONE;
  const rect = range.getBoundingClientRect();
  // Scrolled out of the top of the view: nothing left to point the actions at.
  if (rect.bottom < MIN_TOP_PX) return NONE;
  return {
    exchangeId,
    text,
    left: rect.left + rect.width / 2,
    top: Math.max(rect.top, MIN_TOP_PX),
  };
}

/** The exchange id of the answer containing a node, or `''` if it is outside one. */
function answerIdOf(node: Node): string {
  const element = node instanceof Element ? node : node.parentElement;
  return element?.closest(`[${ANSWER_ATTR}]`)?.getAttribute(ANSWER_ATTR) ?? '';
}
