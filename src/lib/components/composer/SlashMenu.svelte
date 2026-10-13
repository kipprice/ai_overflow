<!-- Popup list of slash commands matching what the user is typing. -->
<script lang="ts">
  let {
    items,
    selected,
    onPick,
  }: { items: string[]; selected: number; onPick: (command: string) => void } =
    $props();
</script>

<!----------------------------------------------------------------------------->

<ul role="listbox">
  {#each items as command, i (command)}
    <li role="option" aria-selected={i === selected}>
      <button
        class:selected={i === selected}
        onmousedown={(e) => e.preventDefault()}
        onclick={() => onPick(command)}
      >
        /{command}
      </button>
    </li>
  {/each}
</ul>

<!----------------------------------------------------------------------------->

<style>
  ul {
    position: absolute;
    bottom: calc(100% - 4px);
    left: 24px;
    min-width: 220px;
    max-height: 260px;
    overflow-y: auto;
    margin: 0;
    padding: 4px;
    list-style: none;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  button {
    display: block;
    width: 100%;
    padding: 4px 10px;
    border: none;
    border-radius: 5px;
    background: none;
    text-align: left;
    font-family: var(--font-code);
    font-size: 13.5px;
  }

  button.selected,
  button:hover {
    background: var(--bg-active);
  }
</style>
