import { MediaQuery } from 'svelte/reactivity';
import type { Appearance } from './types';

const systemPrefersDark = new MediaQuery('prefers-color-scheme: dark');
const CYCLE: Appearance[] = ['system', 'light', 'dark'];

/**
 * Resolves an appearance setting to the colour scheme to render (reactive to macOS changes).
 * @param appearance - the user's setting.
 * @returns `light` or `dark`.
 */
export function resolveTheme(appearance: Appearance): 'light' | 'dark' {
  if (appearance !== 'system') return appearance;
  return systemPrefersDark.current ? 'dark' : 'light';
}

/**
 * The setting the header toggle switches to next: System → Light → Dark → System.
 * @param appearance - the current setting.
 * @returns the next setting.
 */
export function nextAppearance(appearance: Appearance): Appearance {
  return CYCLE[(CYCLE.indexOf(appearance) + 1) % CYCLE.length];
}
