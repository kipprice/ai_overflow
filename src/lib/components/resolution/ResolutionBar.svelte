<!-- A resolved question's answer, pinned where the composer would be. It takes the composer's
     place because a resolved context accepts no further turns, so it carries the ways on in
     the composer's stead: start a new question, fork a follow-up, reopen this question, or
     edit an answer the user wrote themselves. -->
<script lang="ts">
  import type { Resolution } from "$lib/types";
  import Check from "@lucide/svelte/icons/check";
  import ManualNoteEditor from "./ManualNoteEditor.svelte";
  import ResolutionActions from "./ResolutionActions.svelte";
  import ResolutionText from "./ResolutionText.svelte";

  let {
    resolution,
    onNew,
    onReopen,
    onFork,
    onEditNote,
  }: {
    resolution: Resolution;
    onNew: () => void;
    onReopen: () => void;
    onFork: () => void;
    onEditNote: (note: string) => void;
  } = $props();

  let editing = $state(false);
  // The user's own words are theirs to rewrite, here and in the feed alike; an accepted
  // answer is a record of what a model said.
  const editable = $derived(resolution.source !== "accepted");

  /** Saves the edited note and closes the editor. */
  function save(note: string) {
    onEditNote(note);
    editing = false;
  }
</script>

<!----------------------------------------------------------------------------->

<div class="bar">
  <section>
    <p class="tag"><Check size={13} /> Resolved</p>
    {#if editing}
      <ManualNoteEditor
        note={resolution.text}
        onSave={save}
        onCancel={() => (editing = false)}
      />
    {:else}
      <ResolutionText {resolution} />
      <ResolutionActions
        {editable}
        {onNew}
        {onReopen}
        {onFork}
        onEdit={() => (editing = true)}
      />
    {/if}
  </section>
</div>

<!----------------------------------------------------------------------------->

<style>
  .bar {
    padding: 12px 24px 14px;
    border-top: 1px solid var(--border);
  }

  /* The accent fill, lifted off the page by a shadow that inverts with the colour scheme. */
  section {
    max-width: 820px;
    /* Tall enough for the whole resolution, scrolling only once it would crowd the feed. */
    max-height: 44vh;
    overflow-y: auto;
    margin: 0 auto;
    padding: 12px 14px;
    border-radius: var(--radius);
    background: var(--accent);
    color: var(--on-accent);
    box-shadow:
      0 2px 5px -1px var(--shadow-ink),
      0 10px 28px -6px var(--shadow-ink);
  }

  .tag {
    display: flex;
    gap: 5px;
    align-items: center;
    margin: 0 0 6px;
    font-family: var(--font-heading);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.75;
  }
</style>
