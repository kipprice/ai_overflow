/**
 * Searching every context the app has ever kept, across all sessions. Search is something
 * the user asks for: while the query is empty, the sidebar lists the current session as usual.
 * On narrow windows the query is edited in a dialog, which applies or cancels its changes.
 */

import { matchesTopic } from '$lib/search/match';
import { isEmptyQuery, parseQuery } from '$lib/search/query';
import type { Topic } from '$lib/types';
import { openTopic } from './sessions';
import { store } from './store.svelte';

/** What is being searched for, and whether the search dialog (narrow windows) is open. */
export const search = $state({ query: '', dialogOpen: false });

/** The query as it stood when the dialog opened, restored if the dialog is cancelled. */
let queryBeforeDialog = '';

/**
 * Contexts matching the current search, newest first.
 * @returns the matches; empty while there is no search.
 */
export function searchResults(): Topic[] {
  const query = parseQuery(search.query);
  if (isEmptyQuery(query)) return [];
  return store.data.topics
    .filter((t) => matchesTopic(t, query))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Whether the user is searching, which swaps the sidebar's list (or rail of dots) for the
 * results.
 * @returns true while the query has something in it.
 */
export function isSearching(): boolean {
  return search.query.trim() !== '';
}

/**
 * Filters to everything carrying a tag; clicking a tag chip does this.
 * @param label - the tag to filter by.
 */
export function searchTag(label: string) {
  search.query = `#${label}`;
}

/**
 * Opens a search result. The search stays applied, so the user can work through the
 * results; the dialog, if open, closes with its query kept.
 * @param topic - the context to open.
 */
export function openResult(topic: Topic) {
  openTopic(topic);
  search.dialogOpen = false;
}

/** Opens the search dialog, remembering the query to return to if it is cancelled. */
export function openSearchDialog() {
  queryBeforeDialog = search.query;
  search.dialogOpen = true;
}

/** Closes the search dialog, keeping the query typed into it. */
export function applySearchDialog() {
  search.dialogOpen = false;
}

/** Closes the search dialog, putting back the query it opened with. */
export function cancelSearchDialog() {
  search.query = queryBeforeDialog;
  search.dialogOpen = false;
}

/** Ends the search, returning the sidebar to the current session's contexts. */
export function clearSearch() {
  search.query = '';
}
