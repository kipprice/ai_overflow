import { invoke } from '@tauri-apps/api/core';
import type { ExtractedTag, Settings } from '$lib/types';

/**
 * Asks the configured theme model to label a context from its first question.
 * @param settings - supplies the theme harness and model.
 * @param question - the context's first question.
 * @returns the theme label.
 */
export function extractTheme(settings: Settings, question: string) {
  if (settings.themeHarness === 'ollama') {
    return invoke<string>('ollama_theme', { baseUrl: settings.ollamaUrl, model: settings.themeOllamaModel, text: question });
  }
  return invoke<string>('claude_theme', { text: question, model: settings.themeClaudeModel, claudePath: settings.claudePath || null });
}

/**
 * Asks the configured theme model which languages, tools and concepts an exchange was about.
 * Uses the same cheap model as theme extraction, since it is the same kind of short call.
 * @param settings - supplies the theme harness and model.
 * @param question - the question that was asked.
 * @param answer - the answer it got.
 * @param vocabulary - labels already used in the feed, for the model to reuse.
 * @returns the suggested tags, not yet normalised.
 */
export function extractTags(settings: Settings, question: string, answer: string, vocabulary: string[]) {
  if (settings.themeHarness === 'ollama') {
    const model = settings.themeOllamaModel;
    return invoke<ExtractedTag[]>('ollama_tags', { baseUrl: settings.ollamaUrl, model, question, answer, vocabulary });
  }
  const claudePath = settings.claudePath || null;
  return invoke<ExtractedTag[]>('claude_tags', { question, answer, vocabulary, model: settings.themeClaudeModel, claudePath });
}

/**
 * Asks the configured theme model to say, in a sentence, how a question was resolved. Uses
 * the same cheap model as theme extraction because both are short, one-shot helper calls.
 * @param settings - supplies the theme harness and model.
 * @param question - the question that was asked.
 * @param accepted - the answer text the user accepted as the solution.
 * @returns the resolution summary.
 */
export function requestResolutionSummary(settings: Settings, question: string, accepted: string) {
  if (settings.themeHarness === 'ollama') {
    return invoke<string>('ollama_resolution', { baseUrl: settings.ollamaUrl, model: settings.themeOllamaModel, question, accepted });
  }
  return invoke<string>('claude_resolution', { question, accepted, model: settings.themeClaudeModel, claudePath: settings.claudePath || null });
}
