import { invoke } from '@tauri-apps/api/core';

/**
 * Reads the persisted feed.
 * @returns the saved JSON, or `null` on first launch.
 */
export function loadData() {
  return invoke<string | null>('load_data');
}

/**
 * Persists the feed.
 * @param json - the serialised app data.
 */
export function saveData(json: string) {
  return invoke<void>('save_data', { json });
}

/**
 * Locates the app's private working folder for Claude.
 * @returns its absolute path.
 */
export function defaultWorkspace() {
  return invoke<string>('default_workspace');
}

/**
 * Checks that the Claude CLI can be found and run.
 * @param claudePath - explicit CLI path, or blank to auto-detect.
 * @returns the CLI version string.
 */
export function claudeStatus(claudePath: string) {
  return invoke<string>('claude_status', { claudePath: claudePath || null });
}

/**
 * Lists installed Ollama models.
 * @param baseUrl - the Ollama server.
 * @returns model names.
 */
export function ollamaModels(baseUrl: string) {
  return invoke<string[]>('ollama_models', { baseUrl });
}

/**
 * Reads an Ollama model's capabilities (e.g. `thinking`).
 * @param baseUrl - the Ollama server.
 * @param model - the model name.
 * @returns capability names.
 */
export function ollamaCapabilities(baseUrl: string, model: string) {
  return invoke<string[]>('ollama_model_info', { baseUrl, model });
}
