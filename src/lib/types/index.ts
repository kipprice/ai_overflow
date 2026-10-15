/**
 * The app's shared shapes, re-exported so everything can import them from `$lib/types`.
 * Split by concern: the feed itself, resolutions, tags, and what gets persisted.
 */
export type * from './feed';
export type * from './resolution';
export type * from './stored';
export type * from './tag';
