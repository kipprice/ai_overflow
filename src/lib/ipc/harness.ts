import { invoke } from '@tauri-apps/api/core';
import type { Settings } from '$lib/types';

/** One message of conversation history sent to Ollama. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Starts a streaming Claude turn; output arrives as `chat-event`s for `requestId`.
 * @param requestId - id that tags this turn's events.
 * @param prompt - the message or slash command.
 * @param settings - supplies model, effort, CLI path and working folder.
 * @param cwd - resolved working folder for the CLI.
 * @param resume - Claude session to continue, if any.
 * @returns resolves once the turn has finished streaming.
 */
export function claudeSend(requestId: string, prompt: string, settings: Settings, cwd: string, resume?: string) {
  return invoke<void>('claude_send', {
    requestId,
    prompt,
    model: settings.claudeModel,
    effort: settings.claudeEffort || null,
    resume: resume ?? null,
    claudePath: settings.claudePath || null,
    cwd,
  });
}

/**
 * Starts a streaming Ollama turn; output arrives as `chat-event`s for `requestId`.
 * @param requestId - id that tags this turn's events.
 * @param settings - supplies the server URL and model.
 * @param messages - the whole context, ending with the new question.
 * @param think - the `think` parameter, or `undefined` to omit it.
 * @returns resolves once the turn has finished streaming.
 */
export function ollamaSend(requestId: string, settings: Settings, messages: ChatMessage[], think?: boolean | string) {
  return invoke<void>('ollama_chat', {
    requestId,
    baseUrl: settings.ollamaUrl,
    model: settings.ollamaModel,
    messages,
    think: think ?? null,
  });
}

/**
 * Stops an in-flight turn.
 * @param requestId - the turn to stop.
 */
export function cancelRequest(requestId: string) {
  return invoke<void>('cancel_request', { requestId });
}
