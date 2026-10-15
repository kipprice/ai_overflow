import { setNotice } from './notice.svelte';
import { type MarkedResolution, readResolvedMarker } from './resolved-marker';
import { manualAnswer, selfAnswer } from './self-answer';
import { newContext } from './context';
import { currentTopic, startTopic } from './topics';

/**
 * What the app did with composer text: `none` means it is a question for the harness after
 * all, `accepted` that it has been dealt with here, and `rejected` that it was meant for us
 * but couldn't be applied (the composer keeps the text so the user can fix it).
 */
export type LocalCommand = 'none' | 'accepted' | 'rejected';

/**
 * Handles composer text the app answers itself rather than sending on: `/clear` starts a
 * fresh context, and `@resolved` records a resolution — either for the open context, or for
 * a question written in front of the marker and answered after it. Keeping `@resolved` here
 * is the whole point of it: an answer the user already has never reaches a model.
 * @param text - the trimmed composer text.
 * @returns how the text was handled.
 */
export function runLocalCommand(text: string): LocalCommand {
  if (text === '/clear') {
    newContext();
    return 'accepted';
  }
  const marked = readResolvedMarker(text);
  if (!marked) return 'none';
  return marked.question ? askAndResolve(marked) : markResolved(marked.answer);
}

/** Posts a question the user answered themselves, or explains what the message is missing. */
function askAndResolve({ question, answer }: MarkedResolution): LocalCommand {
  if (!answer) {
    setNotice('Write the answer after @resolved, or send the question on its own to ask it.');
    return 'rejected';
  }
  selfAnswer(question, answer);
  return 'accepted';
}

/**
 * Records the open context as resolved. With no context open, the note opens one of its own,
 * so an answer found before the question was ever asked here still has somewhere to live; a
 * bare marker with nothing either side of it has nothing to record.
 */
function markResolved(note: string): LocalCommand {
  const topic = currentTopic();
  if (!topic && !note) {
    setNotice('Nothing to resolve yet — ask a question, or write the answer after @resolved.');
    return 'rejected';
  }
  // No notice on success: the resolution taking the composer's place says it plainly enough,
  // and a notice set here would be stale by the time the composer came back.
  manualAnswer(topic ?? startTopic(), note);
  return 'accepted';
}
