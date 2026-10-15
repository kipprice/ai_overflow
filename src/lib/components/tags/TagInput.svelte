<!-- Inline field for adding tags to a context, suggesting tags already in use as you type.
     Stays open after each tag so several can be added in a row; closes on Escape or blur. -->
<script lang="ts">
  import SuggestList from "$lib/components/common/SuggestList.svelte";
  import { TagInputState } from "./tag-input-state.svelte";

  let {
    exclude,
    onAdd,
    onClose,
  }: {
    exclude: string[];
    onAdd: (label: string) => void;
    onClose: () => void;
  } = $props();

  const field = new TagInputState(() => exclude);
</script>

<!----------------------------------------------------------------------------->

<span class="field">
  <!-- svelte-ignore a11y_autofocus -->
  <input
    type="text"
    bind:value={field.value}
    oninput={() => (field.selected = 0)}
    onkeydown={(e) => field.onKeydown(e, onAdd, onClose)}
    onblur={onClose}
    placeholder="#tag"
    aria-label="Add a tag"
    autofocus
  />
  {#if field.items.length}
    <SuggestList
      items={field.items}
      selected={field.selected}
      onPick={(item) => field.add(item, onAdd)}
      placement="below"
    />
  {/if}
</span>

<!----------------------------------------------------------------------------->

<style>
  .field {
    position: relative;
  }

  input {
    width: 140px;
    border-radius: 999px;
    padding: 1px 10px;
    font-family: var(--font-code);
    font-size: 12.5px;
    outline: none;
  }

  input:focus {
    border-color: var(--accent);
  }
</style>
