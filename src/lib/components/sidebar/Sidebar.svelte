<!-- Left sidebar: session picker, search, and the session's themes (or search results across
     every session), collapsing to a rail of context dots on narrow windows. -->
<script lang="ts">
  import SearchBox from "$lib/components/search/SearchBox.svelte";
  import SearchDialog from "$lib/components/search/SearchDialog.svelte";
  import SearchResults from "$lib/components/search/SearchResults.svelte";
  import { compactLayout } from "$lib/layout";
  import { isSearching } from "$lib/state/search.svelte";
  import DotRail from "./DotRail.svelte";
  import SessionPicker from "./SessionPicker.svelte";
  import ThemeList from "./ThemeList.svelte";
</script>

<!----------------------------------------------------------------------------->

<aside>
  {#if compactLayout.current}
    <DotRail />
    <SearchDialog />
  {:else}
    <SessionPicker />
    <SearchBox />
    {#if isSearching()}
      <SearchResults />
    {:else}
      <ThemeList />
    {/if}
  {/if}
</aside>

<!----------------------------------------------------------------------------->

<style>
  aside {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
  }
</style>
