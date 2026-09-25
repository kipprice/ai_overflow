import { claudeEfforts, ollamaEfforts } from '$lib/models';
import { ollama } from './ollama.svelte';
import { store } from './store.svelte';

/**
 * Effort levels the selected model supports, so the picker is only shown when relevant.
 * @returns the levels, an empty list if the model has no effort control, or `null` while an
 * Ollama model's capabilities are still loading.
 */
export function effortOptions(): string[] | null {
  const s = store.data.settings;
  if (s.harness === 'claude') return claudeEfforts(s.claudeModel);
  const capabilities = ollama.capabilities[s.ollamaModel];
  return capabilities ? ollamaEfforts(s.ollamaModel, capabilities) : null;
}

/**
 * The selected effort for the current harness.
 * @returns the level, or an empty string for the model default.
 */
export function currentEffort(): string {
  const s = store.data.settings;
  return s.harness === 'claude' ? s.claudeEffort : s.ollamaEffort;
}

/**
 * The settings key that stores effort for the current harness.
 * @returns the key to update.
 */
export function effortKey(): 'claudeEffort' | 'ollamaEffort' {
  return store.data.settings.harness === 'claude' ? 'claudeEffort' : 'ollamaEffort';
}
