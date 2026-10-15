<!-- Every context, from any session, matching the search, newest first. -->
<script lang="ts">
  import { searchResults } from "$lib/state/search.svelte";
  import SearchResult from "./SearchResult.svelte";

  const results = $derived(searchResults());
</script>

<!----------------------------------------------------------------------------->

<nav aria-label="Search results">
  {#each results as topic (topic.id)}
    <SearchResult {topic} />
  {:else}
    <p class="empty">
      No contexts match. Words search what was asked and answered; <code
        >#tag</code
      > narrows to a tag.
    </p>
  {/each}
</nav>

<!----------------------------------------------------------------------------->

<style>
  nav {
    flex: 1;
    overflow-y: auto;
    padding: 4px 6px 8px;
  }

  .empty {
    padding: 4px 8px;
    color: var(--text-muted);
    font-size: 12px;
  }
</style>
