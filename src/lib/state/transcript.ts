import type { ChatMessage } from '$lib/ipc/harness';
import type { Exchange } from '$lib/types';

/**
 * Whether text is a slash command rather than a question.
 * @param text - the text the user sent.
 * @returns true for input like `/compact`.
 */
export function isSlashCommand(text: string): boolean {
  return text.trimStart().startsWith('/');
}

/**
 * Whether this is the context's first real question (the one its theme is named from).
 * @param prior - exchanges already in the context.
 * @param question - the text being sent.
 * @returns true if it's a question and no earlier question was asked.
 */
export function isFirstQuestion(prior: Exchange[], question: string): boolean {
  return !isSlashCommand(question) && prior.every((e) => isSlashCommand(e.question));
}

/**
 * Whether an exchange carries conversational content (not a slash command or failure). An
 * exchange with no answer is skipped whatever its question: a turn that produced nothing adds
 * nothing to the history, and an empty message is something models can refuse outright.
 * @param exchange - the exchange to check.
 * @returns true if it should be replayed as context.
 */
export function isConversational(exchange: Exchange): boolean {
  return exchange.status === 'done' && !isSlashCommand(exchange.question) && !!exchange.answer;
}

/**
 * Builds the Ollama message history: every prior conversational exchange, then the question.
 * @param prior - exchanges already in the context.
 * @param question - the new question.
 * @returns the messages to send.
 */
export function ollamaMessages(prior: Exchange[], question: string): ChatMessage[] {
  const history = prior.filter(isConversational).flatMap(replayExchange);
  return [...history, { role: 'user', content: question }];
}

/** One past exchange as messages; a note the user left stands alone, as their turn. */
function replayExchange(exchange: Exchange): ChatMessage[] {
  const answer: ChatMessage = {
    role: exchange.selfAnswered ? 'user' : 'assistant',
    content: exchange.answer,
  };
  return exchange.question ? [{ role: 'user', content: exchange.question }, answer] : [answer];
}

/**
 * Builds the Claude prompt. Claude remembers its own turns via its session, but not turns
 * answered by Ollama — or by the user themselves — since then, so those are prepended as
 * context.
 * @param prior - exchanges already in the context.
 * @param question - the new question.
 * @returns the prompt to send.
 */
export function claudePrompt(prior: Exchange[], question: string): string {
  if (isSlashCommand(question)) return question;
  const lastClaude = prior.findLastIndex(
    (e) => e.harness === 'claude' && e.status === 'done' && !e.selfAnswered,
  );
  const missed = prior.slice(lastClaude + 1).filter(isConversational);
  if (missed.length === 0) return question;
  const context = missed.map(formatExchange).join('\n\n');
  return `Earlier in this conversation (answered by another model, or by the user themselves):\n\n${context}\n\n---\n\n${question}`;
}

/** Renders one exchange as a User/Assistant pair, saying so when the user answered it. */
function formatExchange(exchange: Exchange): string {
  const answerer = exchange.selfAnswered ? 'User (answering themselves)' : 'Assistant';
  return `User: ${exchange.question}\n\n${answerer}: ${exchange.answer}`;
}
