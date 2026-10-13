<!-- Editor for an answer the user wrote themselves, taking its place inside the resolution
     bar so what they wrote after `@resolved` can be fixed without reopening the question. -->
<script lang="ts">
  import { untrack } from "svelte";

  let {
    note,
    onSave,
    onCancel,
  }: { note: string; onSave: (note: string) => void; onCancel: () => void } =
    $props();

  // Start from the stored note; later changes shouldn't overwrite what's being typed.
  let draft = $state(untrack(() => note));

  /** Enter adds a line, so saving is Cmd/Ctrl+Enter; Escape leaves the note as it was. */
  function onkeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSave(draft);
    } else if (event.key === "Escape") {
      // Keep Escape from reaching the window, where it would cancel a streaming answer.
      event.stopPropagation();
      onCancel();
    }
  }

  function selectAll(textarea: HTMLTextAreaElement) {
    textarea.focus();
    textarea.select();
  }
</script>

<!----------------------------------------------------------------------------->

<textarea
  bind:value={draft}
  {onkeydown}
  use:selectAll
  rows="3"
  placeholder="What settled the question?"
  aria-label="Resolution note"
></textarea>
<div class="actions">
  <button class="accent-button filled" onclick={() => onSave(draft)}
    >Save note</button
  >
  <button class="accent-button" onclick={onCancel}>Cancel</button>
  <p class="hint"><kbd>Cmd+Enter</kbd> save · <kbd>Esc</kbd> cancel</p>
</div>

<!----------------------------------------------------------------------------->

<style>
  textarea {
    display: block;
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--on-accent);
    border-radius: 6px;
    /* A faint well in the accent fill, so the field reads as part of the bar. */
    background: rgba(255, 255, 255, 0.35);
    color: var(--on-accent);
    resize: vertical;
    outline: none;
  }

  textarea::placeholder {
    color: var(--on-accent);
    opacity: 0.55;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 10px;
  }

  .hint {
    margin: 0;
    font-size: 11px;
    opacity: 0.7;
  }

  kbd {
    font-family: var(--font-code);
    font-size: 11.5px;
  }
</style>
