/**
 * Reading composer text before anything is sent: `#tag` tokens are split off to tag the
 * context, and text the app handles itself (`/clear`, `@resolved`) goes no further.
 */

import { readTagTokens } from '$lib/tags/tokens';
import { runLocalCommand } from './local-commands';
import { setNotice } from './notice.svelte';
import { addUserTags } from './tag-edit';
import { currentTopic } from './topics';
import { isSlashCommand } from './transcript';

/**
 * Composer text, read for sending: either already dealt with here (and whether the composer
 * should be emptied), or a question for the harness along with the tags written into it.
 */
export type Outgoing =
  | { kind: 'handled'; accepted: boolean }
  | { kind: 'question'; question: string; labels: string[] };

/**
 * Reads composer text for sending. A message of nothing but tags tags the open context; tags
 * written alongside a question go on the context the question lands in, and never reach the
 * model. Slash commands are passed through whole, since their arguments are not ours to read.
 * @param text - the trimmed composer text.
 * @returns what is left to send, if anything.
 */
export function readOutgoing(text: string): Outgoing {
  const { labels, text: rest } = isSlashCommand(text) ? { labels: [], text } : readTagTokens(text);
  if (!rest) return handled(tagOpenContext(labels));
  const local = runLocalCommand(rest);
  if (local === 'none') return { kind: 'question', question: rest, labels };
  // Only a resolution that went through has a context to tag; a rejected one keeps its text.
  if (local === 'accepted') tagOpenContext(labels);
  return handled(local === 'accepted');
}

/** Wraps the outcome of text the app dealt with itself. */
function handled(accepted: boolean): Outgoing {
  return { kind: 'handled', accepted };
}

/** Adds tags to the open context, explaining why not when there is none to add them to. */
function tagOpenContext(labels: string[]): boolean {
  if (labels.length === 0) return true;
  const topic = currentTopic();
  if (!topic) {
    setNotice('Tags go on the open context — ask a question first, or tag it as you ask.');
    return false;
  }
  addUserTags(topic, labels);
  setNotice(`Tagged ${labels.map((l) => `#${l}`).join(' ')}`);
  return true;
}
