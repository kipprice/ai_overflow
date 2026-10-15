<!-- Search as a modal, for narrow windows where the sidebar is only a rail of dots. Apply (or
     Enter) keeps the search and filters the rail; Cancel (or Escape) puts back the search it
     opened with. Opening a result also applies. -->
<script lang="ts">
  import {
    applySearchDialog,
    cancelSearchDialog,
    isSearching,
    search,
  } from "$lib/state/search.svelte";
  import SearchBox from "./SearchBox.svelte";
  import SearchDialogActions from "./SearchDialogActions.svelte";
  import SearchResults from "./SearchResults.svelte";

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (search.dialogOpen && !dialog?.open) dialog?.showModal();
    if (!search.dialogOpen && dialog?.open) dialog.close();
  });

  // Widening the window swaps the rail (and this dialog) for the full sidebar, whose own
  // search shows the same query; the dialog must not spring back open on the next narrowing.
  $effect(() => () => applySearchDialog());

  /** Escape closes the dialog natively; while it was still meant to be open, that's a cancel. */
  function onclose() {
    if (search.dialogOpen) cancelSearchDialog();
  }

  /** Keeps Escape from the window, where it would otherwise stop a streaming reply. */
  function onkeydown(event: KeyboardEvent) {
    if (event.key === "Escape") event.stopPropagation();
  }
</script>

<!----------------------------------------------------------------------------->

<dialog bind:this={dialog} class="modal" {onclose} {onkeydown}>
  {#if search.dialogOpen}
    <SearchBox autofocus inDialog />
    {#if isSearching()}
      <SearchResults />
    {/if}
    <SearchDialogActions />
  {/if}
</dialog>

<!----------------------------------------------------------------------------->

<style>
  dialog {
    padding-top: 4px;
  }
</style>
