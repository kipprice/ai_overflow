import { MediaQuery } from 'svelte/reactivity';

/**
 * True on narrow windows, where the sidebar collapses to a rail of context dots.
 * Read `compactLayout.current` reactively.
 */
export const compactLayout = new MediaQuery('max-width: 720px');
