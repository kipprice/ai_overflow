import { defaultWorkspace, loadData, saveData } from '$lib/ipc/system';
import type { Settings } from '$lib/types';
import { freshData, restoreData } from './defaults';

/** The single reactive source of truth for the whole app. */
export const store = $state({
  data: freshData(),
  loaded: false,
  loadError: '',
  /** Absolute path of the app's private Claude workspace. */
  workspace: '',
});

const SAVE_DELAY_MS = 300;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Loads the persisted feed into the store. Call once at startup.
 * @returns resolves when loading has finished (successfully or not).
 */
export async function loadStore() {
  try {
    store.data = restoreData(await loadData());
    store.workspace = await defaultWorkspace();
  } catch (err) {
    store.loadError = String(err);
  }
  store.loaded = true;
}

/**
 * Schedules a save. Saves are debounced so bursts of changes cost one disk write.
 * Mutations call this explicitly rather than deep-watching the store, which would
 * re-serialise the whole feed on every streamed token.
 */
export function scheduleSave() {
  if (!store.loaded || store.loadError) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveData(JSON.stringify(store.data)).catch((err) => console.error('Save failed', err));
  }, SAVE_DELAY_MS);
}

/**
 * Updates some settings and persists them.
 * @param patch - the settings to change.
 */
export function updateSettings(patch: Partial<Settings>) {
  Object.assign(store.data.settings, patch);
  scheduleSave();
}

/**
 * The folder Claude runs in: the user's choice, else the private workspace.
 * @returns an absolute path.
 */
export function claudeCwd(): string {
  return store.data.settings.claudeCwd.trim() || store.workspace;
}
