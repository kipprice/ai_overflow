import type { Harness } from './types';

/** Shown for Claude before the CLI has reported its real list (on the first turn). */
const FALLBACK_CLAUDE_COMMANDS = ['compact', 'context', 'cost', 'usage', 'init', 'review'];
const MAX_SUGGESTIONS = 8;

/**
 * Slash commands available for a harness. `/clear` is always available because the app
 * handles it itself; everything else is passed through to the harness.
 * @param harness - the selected harness.
 * @param claudeCommands - commands last reported by the Claude CLI.
 * @returns command names without the leading slash.
 */
export function slashCommands(harness: Harness, claudeCommands: string[]): string[] {
  const reported = claudeCommands.length ? claudeCommands : FALLBACK_CLAUDE_COMMANDS;
  const passthrough = harness === 'claude' ? reported : [];
  return ['clear', ...passthrough.filter((c) => c !== 'clear')];
}

/**
 * Suggests commands for what the user is typing. Only a lone `/word` triggers suggestions.
 * @param text - the composer text.
 * @param commands - available command names.
 * @returns matching commands, prefix matches first.
 */
export function matchCommands(text: string, commands: string[]): string[] {
  if (!/^\/\S*$/.test(text)) return [];
  const query = text.slice(1).toLowerCase();
  const prefix = commands.filter((c) => c.toLowerCase().startsWith(query));
  const partial = commands.filter((c) => !prefix.includes(c) && c.toLowerCase().includes(query));
  return [...prefix, ...partial].slice(0, MAX_SUGGESTIONS);
}
