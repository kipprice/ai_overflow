<!-- One tag: a dot coloured by its facet, then its label. Clicking it searches for everything
     else carrying it; the × (when given) removes it for good. -->
<script lang="ts">
  import type { Tag } from "$lib/types";

  let {
    tag,
    onSelect,
    onRemove,
  }: { tag: Tag; onSelect: () => void; onRemove?: () => void } = $props();

  const origin = $derived(tag.source === "auto" ? "suggested" : "added by you");
</script>

<!----------------------------------------------------------------------------->

<span class="chip" title="{tag.facet} · {origin}">
  <button class="label" onclick={onSelect}>
    <i style:background="var(--facet-{tag.facet})"></i>#{tag.label}
  </button>
  {#if onRemove}
    <button
      class="remove"
      onclick={onRemove}
      title="Remove for good"
      aria-label="Remove tag {tag.label}">×</button
    >
  {/if}
</span>

<!----------------------------------------------------------------------------->

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-raised);
    font-family: var(--font-code);
    font-size: 12.5px;
  }

  .chip:hover {
    border-color: var(--text-muted);
  }

  button {
    border: none;
    background: none;
    color: inherit;
  }

  .label {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 1px 8px;
  }

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .remove {
    padding: 0 7px 0 0;
    color: var(--text-muted);
    visibility: hidden;
  }

  .chip:hover .remove {
    visibility: visible;
  }

  .remove:hover {
    color: var(--danger);
  }
</style>
