<!-- Compact sidebar for narrow windows: session and search buttons, then Ask Question and one
     dot per context — the session's, or every match while a search filter is applied, in
     which case the search button is highlighted. -->
<script lang="ts">
  import CalendarRange from "@lucide/svelte/icons/calendar-range";
  import Search from "@lucide/svelte/icons/search";
  import {
    isSearching,
    openSearchDialog,
    searchResults,
  } from "$lib/state/search.svelte";
  import { sessionTopics } from "$lib/state/topics";
  import AskQuestion from "./AskQuestion.svelte";
  import SessionDialog from "./SessionDialog.svelte";
  import ThemeDot from "./ThemeDot.svelte";
  import { railTip } from "./rail-tip";

  let sessionsOpen = $state(false);
  const filtered = $derived(isSearching());
  const topics = $derived(filtered ? searchResults() : sessionTopics());
  const searchLabel = $derived(
    filtered ? "Search (filter applied)" : "Search all contexts",
  );
</script>

<!----------------------------------------------------------------------------->

<button
  class="icon-button sessions"
  onclick={() => (sessionsOpen = true)}
  aria-label="Sessions"
  {@attach railTip("Sessions")}
>
  <CalendarRange size={15} />
</button>
<button
  class="icon-button search"
  class:filtered
  onclick={openSearchDialog}
  aria-label={searchLabel}
  {@attach railTip(searchLabel)}
>
  <Search size={15} />
</button>
<nav>
  {#if !filtered}
    <AskQuestion compact />
  {/if}
  {#each topics as topic (topic.id)}
    <ThemeDot {topic} />
  {/each}
</nav>
<SessionDialog open={sessionsOpen} onClose={() => (sessionsOpen = false)} />

<!----------------------------------------------------------------------------->

<style>
  .icon-button {
    display: flex;
    padding: 5px 7px;
  }

  .sessions {
    margin: 10px auto 2px;
  }

  .search {
    margin: 0 auto 6px;
  }

  .search.filtered {
    color: var(--accent-ink);
    background: var(--accent-wash);
  }

  nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }
</style>
