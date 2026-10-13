<!-- Quick actions floating above text highlighted inside an answer: copy the snippet, or
     accept it as what resolved the question. -->
<script lang="ts">
  import Check from "@lucide/svelte/icons/check";
  import Copy from "@lucide/svelte/icons/copy";

  let {
    left,
    top,
    onCopy,
    onResolve,
  }: { left: number; top: number; onCopy: () => void; onResolve: () => void } =
    $props();

  /** Suppressing mouse-down stops the browser clearing the highlight before the click lands. */
  function keepSelection(event: MouseEvent) {
    event.preventDefault();
  }
</script>

<!----------------------------------------------------------------------------->

<div class="actions" style:left="{left}px" style:top="{top}px">
  <button onmousedown={keepSelection} onclick={onCopy}
    ><Copy size={13} /> Copy</button
  >
  <button onmousedown={keepSelection} onclick={onResolve}>
    <Check size={13} /> Resolve with this
  </button>
</div>

<!----------------------------------------------------------------------------->

<style>
  .actions {
    position: fixed;
    z-index: 2;
    display: flex;
    gap: 2px;
    padding: 3px;
    transform: translate(-50%, calc(-100% - 8px));
    border-radius: 7px;
    background: var(--bg-raised);
    box-shadow:
      0 0 0 1px var(--border),
      0 6px 16px -6px rgba(0, 0, 0, 0.45);
  }

  button {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    border: none;
    border-radius: 5px;
    padding: 3px 8px;
    background: none;
    font-size: 12px;
    white-space: nowrap;
  }

  button:hover {
    background: var(--accent-overlay);
    color: var(--accent-ink);
  }
</style>
