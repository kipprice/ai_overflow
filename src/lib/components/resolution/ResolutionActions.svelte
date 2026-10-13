<!-- The ways on from a resolved question, which stand in for the composer the resolution
     takes the place of: ask something new, fork a follow-up, reopen this question, or — when
     the resolution is the user's own words — edit what it says. -->
<script lang="ts">
  import GitFork from "@lucide/svelte/icons/git-fork";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Plus from "@lucide/svelte/icons/plus";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";

  let {
    editable,
    onNew,
    onReopen,
    onFork,
    onEdit,
  }: {
    editable: boolean;
    onNew: () => void;
    onReopen: () => void;
    onFork: () => void;
    onEdit: () => void;
  } = $props();
</script>

<!----------------------------------------------------------------------------->

<div class="actions">
  <button class="accent-button filled" onclick={onNew}
    ><Plus size={14} /> New question</button
  >
  <button class="accent-button" onclick={onFork}
    ><GitFork size={14} /> Ask a follow-up</button
  >
  <button class="accent-button" onclick={onReopen}>
    <RotateCcw size={14} /> Reopen question
  </button>
  {#if editable}
    <button class="accent-button" onclick={onEdit}
      ><Pencil size={14} /> Edit note</button
    >
  {/if}
</div>

<!----------------------------------------------------------------------------->

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
</style>
