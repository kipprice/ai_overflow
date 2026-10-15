<!-- The search dialog's buttons: Clear filter (while one is applied) shows every context again,
     Cancel puts back the search the dialog opened with, and Apply keeps the one typed. -->
<script lang="ts">
  import {
    applySearchDialog,
    cancelSearchDialog,
    clearSearch,
    isSearching,
  } from "$lib/state/search.svelte";

  function clearFilter() {
    clearSearch();
    applySearchDialog();
  }
</script>

<!----------------------------------------------------------------------------->

<footer>
  {#if isSearching()}
    <button class="clear" onclick={clearFilter}>Clear filter</button>
  {/if}
  <button onclick={cancelSearchDialog}>Cancel</button>
  <button class="apply" onclick={applySearchDialog}>Apply</button>
</footer>

<!----------------------------------------------------------------------------->

<style>
  footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 10px;
    border-top: 1px solid var(--border);
  }

  button {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 3px 12px;
    background: var(--bg-raised);
    font-size: 12.5px;
  }

  button:hover {
    background: var(--bg-hover);
  }

  .clear {
    margin-right: auto;
  }

  .apply {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 600;
  }

  .apply:hover {
    background: var(--accent);
    opacity: 0.85;
  }
</style>
