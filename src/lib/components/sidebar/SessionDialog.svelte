<!-- Session switching as a modal, for the narrow-window rail: pick a session to open it, or
     start a new one. Closing (Escape, the backdrop, or a choice) calls `onClose`. -->
<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { sessionIsEmpty, startSession } from "$lib/state/sessions";
  import SessionList from "./SessionList.svelte";

  let { open, onClose }: { open: boolean; onClose: () => void } = $props();
  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  });

  function startNew() {
    startSession();
    onClose();
  }

  /** Keeps Escape from the window, where it would otherwise stop a streaming reply. */
  function onkeydown(event: KeyboardEvent) {
    if (event.key === "Escape") event.stopPropagation();
  }

  /** A click landing on the dialog itself, not its contents, is a click on the backdrop. */
  function onclick(event: MouseEvent) {
    if (event.target === dialog) onClose();
  }
</script>

<!----------------------------------------------------------------------------->

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  class="modal"
  aria-label="Sessions"
  onclose={onClose}
  {onkeydown}
  {onclick}
>
  <SessionList onChosen={onClose} />
  <footer>
    <button
      onclick={startNew}
      disabled={sessionIsEmpty()}
      title={sessionIsEmpty() ? "This session is still empty" : undefined}
    >
      <Plus size={14} /> New session
    </button>
  </footer>
</dialog>

<!----------------------------------------------------------------------------->

<style>
  footer {
    display: flex;
    justify-content: flex-end;
    padding: 10px;
    border-top: 1px solid var(--border);
  }

  button {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    border: 1px solid var(--accent);
    border-radius: 6px;
    padding: 3px 12px;
    background: var(--accent);
    color: var(--on-accent);
    font-size: 12.5px;
    font-weight: 600;
  }

  button:hover:not(:disabled) {
    opacity: 0.85;
  }

  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
</style>
