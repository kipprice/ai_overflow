<!-- Modal settings: theme extraction model and harness connection details. -->
<script lang="ts">
  import ConnectionSettings from "./ConnectionSettings.svelte";
  import ThemeSettings from "./ThemeSettings.svelte";

  let { open = $bindable(false) }: { open: boolean } = $props();
  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  });
</script>

<!----------------------------------------------------------------------------->

<dialog bind:this={dialog} onclose={() => (open = false)}>
  <header>
    <h2>Settings</h2>
    <button
      class="icon-button"
      onclick={() => (open = false)}
      aria-label="Close">×</button
    >
  </header>
  {#if open}
    <ThemeSettings />
    <ConnectionSettings />
  {/if}
</dialog>

<!----------------------------------------------------------------------------->

<style>
  dialog {
    width: min(520px, 90vw);
    padding: 18px 22px 22px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg);
    color: var(--text);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.35);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 {
    margin: 0;
    font-size: 16px;
  }

  dialog :global(fieldset) {
    display: grid;
    gap: 10px;
    margin: 16px 0 0;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  dialog :global(legend) {
    padding: 0 4px;
    font-weight: 600;
  }

  dialog :global(label) {
    display: grid;
    gap: 3px;
    font-size: 12px;
    color: var(--text-muted);
  }

  dialog :global(.note) {
    margin: 0;
    font-size: 11.5px;
    color: var(--text-muted);
  }
</style>
