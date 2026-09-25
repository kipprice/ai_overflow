import { ollamaCapabilities, ollamaModels } from '$lib/ipc/system';
import { store } from './store.svelte';

/** Installed Ollama models and their capabilities, discovered from the local server. */
export const ollama = $state({
  models: [] as string[],
  error: '',
  capabilities: {} as Record<string, string[]>,
});

/**
 * Reloads the installed model list, picking a default chat/theme model if none is set.
 * @returns resolves once the list (or an error) is available.
 */
export async function refreshOllamaModels() {
  const settings = store.data.settings;
  try {
    ollama.models = await ollamaModels(settings.ollamaUrl);
    ollama.error = ollama.models.length ? '' : 'No models installed. Run `ollama pull <model>`.';
    const first = ollama.models[0] ?? '';
    if (!ollama.models.includes(settings.ollamaModel)) settings.ollamaModel = first;
    if (!ollama.models.includes(settings.themeOllamaModel)) settings.themeOllamaModel = first;
  } catch (err) {
    ollama.models = [];
    ollama.error = String(err);
  }
}

/**
 * Fetches (once) and caches a model's capabilities.
 * @param model - the model name.
 * @returns resolves once the capabilities are cached.
 */
export async function loadCapabilities(model: string) {
  if (!model || ollama.capabilities[model]) return;
  try {
    ollama.capabilities[model] = await ollamaCapabilities(store.data.settings.ollamaUrl, model);
  } catch {
    ollama.capabilities[model] = [];
  }
}
