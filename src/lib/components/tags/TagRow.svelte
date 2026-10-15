<!-- A context's tags, under its theme: click one to search for it, × to remove it for good,
     add one with suggestions from the tags already in use, or autotag the context. -->
<script lang="ts">
  import { searchTag } from "$lib/state/search.svelte";
  import { addUserTags, removeTag } from "$lib/state/tag-edit";
  import type { Topic } from "$lib/types";
  import AutotagButton from "./AutotagButton.svelte";
  import TagChip from "./TagChip.svelte";
  import TagInput from "./TagInput.svelte";

  let { topic }: { topic: Topic } = $props();
  let adding = $state(false);

  const labels = $derived(topic.tags.map((t) => t.label));
</script>

<!----------------------------------------------------------------------------->

<div class="tags">
  {#each topic.tags as tag (tag.label)}
    <TagChip
      {tag}
      onSelect={() => searchTag(tag.label)}
      onRemove={() => removeTag(topic, tag.label)}
    />
  {/each}
  {#if adding}
    <TagInput
      exclude={labels}
      onAdd={(label) => addUserTags(topic, [label])}
      onClose={() => (adding = false)}
    />
  {:else}
    <button class="icon-button add" onclick={() => (adding = true)}>
      + tag
    </button>
  {/if}
  <AutotagButton {topic} />
</div>

<!----------------------------------------------------------------------------->

<style>
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin: -4px 0 14px;
  }

  .add {
    font-family: var(--font-code);
    font-size: 12px;
  }
</style>
