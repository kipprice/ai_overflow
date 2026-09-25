import type { Harness } from './types';

/** A Claude model offered in the model picker. */
export interface ClaudeModel {
  id: string;
  label: string;
  /** Supported effort levels; empty when the model has no effort control. */
  efforts: string[];
}

const ALL_EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'];
const NO_XHIGH = ['low', 'medium', 'high', 'max'];

/** Claude models available through the Claude Code CLI, newest first. */
export const CLAUDE_MODELS: ClaudeModel[] = [
  { id: 'claude-fable-5-1', label: 'Fable 5.1', efforts: ALL_EFFORTS },
  { id: 'claude-opus-5', label: 'Opus 5', efforts: ALL_EFFORTS },
  { id: 'claude-sonnet-5', label: 'Sonnet 5', efforts: ALL_EFFORTS },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5', efforts: [] },
  { id: 'claude-opus-4-8', label: 'Opus 4.8', efforts: ALL_EFFORTS },
  { id: 'claude-opus-4-7', label: 'Opus 4.7', efforts: ALL_EFFORTS },
  { id: 'claude-opus-4-6', label: 'Opus 4.6', efforts: NO_XHIGH },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6', efforts: NO_XHIGH },
];

export const HARNESSES: { id: Harness; label: string }[] = [
  { id: 'claude', label: 'Claude' },
  { id: 'ollama', label: 'Ollama' },
];

/**
 * Effort levels a Claude model supports.
 * @param modelId - the Claude model id.
 * @returns the supported levels, or an empty list if effort isn't configurable.
 */
export function claudeEfforts(modelId: string): string[] {
  return CLAUDE_MODELS.find((m) => m.id === modelId)?.efforts ?? [];
}

/**
 * Effort levels an Ollama model supports, based on its reported capabilities.
 * gpt-oss takes low/medium/high; other thinking models only switch thinking on or off.
 * @param model - the Ollama model name.
 * @param capabilities - capabilities reported by `/api/show`.
 * @returns the supported levels, or an empty list for non-thinking models.
 */
export function ollamaEfforts(model: string, capabilities: string[]): string[] {
  if (!capabilities.includes('thinking')) return [];
  return model.startsWith('gpt-oss') ? ['low', 'medium', 'high'] : ['off', 'on'];
}

/**
 * Converts an Ollama effort choice into the API's `think` parameter.
 * @param effort - the chosen level; empty string means the model default.
 * @returns `undefined` to omit the parameter, a boolean, or a level string.
 */
export function ollamaThink(effort: string): boolean | string | undefined {
  if (effort === '') return undefined;
  if (effort === 'on' || effort === 'off') return effort === 'on';
  return effort;
}
