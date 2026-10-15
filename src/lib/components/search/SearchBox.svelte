<!-- The search field: words match a context's text, `#tag` matches its tags. In the sidebar,
     Escape clears it; in the search dialog, Enter applies the search and Escape cancels it. -->
<script lang="ts">
  import {
    applySearchDialog,
    clearSearch,
    search,
  } from "$lib/state/search.svelte";

  let {
    autofocus = false,
    inDialog = false,
  }: { autofocus?: boolean; inDialog?: boolean } = $props();

  /** Applies the dialog on Enter; outside it, clears the search on Escape. */
  function onkeydown(event: KeyboardEvent) {
    if (inDialog && event.key === "Enter") {
      event.preventDefault();
      applySearchDialog();
    } else if (!inDialog && event.key === "Escape" && search.query) {
      // Kept from the window, where Escape would otherwise stop a streaming reply.
      event.preventDefault();
      event.stopPropagation();
      clearSearch();
    }
  }
</script>

<!----------------------------------------------------------------------------->

<div class="box">
  <!-- svelte-ignore a11y_autofocus -->
  <input
    type="search"
    bind:value={search.query}
    {onkeydown}
    {autofocus}
    placeholder="Search all contexts · #tag"
    aria-label="Search all contexts"
    spellcheck="false"
  />
</div>

<!----------------------------------------------------------------------------->

<style>
  .box {
    padding: 8px 10px 4px;
  }

  input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-raised);
    font-size: 12.5px;
    outline: none;
  }

  input:focus {
    border-color: var(--accent);
  }
</style>
