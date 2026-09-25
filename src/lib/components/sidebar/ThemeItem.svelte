<!-- One theme in the sidebar: opens its context, renames it on double-click, and can
     permanently delete it (two clicks). -->
<script lang="ts">
  import { store } from "$lib/state/store.svelte";
  import { nameTopic } from "$lib/state/naming";
  import { deleteTopic, selectTopic } from "$lib/state/topics";
  import { topicLabel } from "$lib/topic-label";
  import type { Topic } from "$lib/types";
  import ThemeRename from "./ThemeRename.svelte";

  let { topic }: { topic: Topic } = $props();
  let confirming = $state(false);
  let renaming = $state(false);
</script>

<div
  role="group"
  class="item"
  class:active={topic.id === store.data.currentTopicId}
  onmouseleave={() => (confirming = false)}
>
  {#if renaming}
    <ThemeRename {topic} onDone={() => (renaming = false)} />
  {:else}
    <button
      class="label"
      onclick={() => selectTopic(topic.id)}
      ondblclick={() => (renaming = true)}
      title="{topicLabel(topic)} (double-click to rename)"
    >
      {topicLabel(topic)}
    </button>
  {/if}
  {#if topic.themeStatus === "failed"}
    <button class="icon-button" onclick={() => nameTopic(topic)} title="Retry naming">↻</button>
  {/if}
  {#if confirming}
    <button class="confirm" onclick={() => deleteTopic(topic.id)}>Delete</button>
  {:else}
    <button
      class="icon-button remove"
      onclick={() => (confirming = true)}
      title="Delete theme"
      aria-label="Delete theme"
    >
      ×
    </button>
  {/if}
</div>

<style>
  .item {
    display: flex;
    align-items: center;
    border-radius: 6px;
  }

  .item:hover {
    background: var(--accent-overlay);
  }

  .label {
    flex: 1;
    min-width: 0;
    padding: 5px 8px;
    border: none;
    background: none;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item.active {
    color: var(--accent-ink);
    background: var(--accent-wash);
  }

  .remove {
    visibility: hidden;
  }

  .item:hover .remove {
    visibility: visible;
  }

  .confirm {
    margin-right: 4px;
    border: none;
    border-radius: 4px;
    padding: 1px 6px;
    background: var(--danger);
    color: white;
    font-size: 12px;
  }
</style>
