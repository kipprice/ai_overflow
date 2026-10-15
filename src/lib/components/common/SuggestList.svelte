<!-- Popup list of suggestions for what the user is typing: slash commands, tags or
     `@resolved`. Positioned against its nearest positioned ancestor. -->
<script lang="ts">
  import type { SuggestItem } from "./suggest";

  let {
    items,
    selected,
    onPick,
    placement = "above",
    left = 0,
  }: {
    items: SuggestItem[];
    selected: number;
    onPick: (item: SuggestItem) => void;
    placement?: "above" | "below";
    left?: number;
  } = $props();
</script>

<!----------------------------------------------------------------------------->

<ul role="listbox" class={placement} style:left="{left}px">
  {#each items as item, i (item.value)}
    <li role="option" aria-selected={i === selected}>
      <button
        class:selected={i === selected}
        onmousedown={(e) => e.preventDefault()}
        onclick={() => onPick(item)}
      >
        <span>{item.value}</span>
        {#if item.hint}<small>{item.hint}</small>{/if}
      </button>
    </li>
  {/each}
</ul>

<!----------------------------------------------------------------------------->

<style>
  ul {
    position: absolute;
    z-index: 10;
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

  .above {
    bottom: calc(100% - 4px);
  }

  .below {
    top: calc(100% + 4px);
  }

  button {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    align-items: baseline;
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

  small {
    font-family: var(--font);
    font-size: 11px;
    color: var(--text-muted);
  }
</style>
