<!-- One context as a dot; hovering shows its theme in a popover, clicking opens it. -->
<script lang="ts">
  import { store } from "$lib/state/store.svelte";
  import { selectTopic } from "$lib/state/topics";
  import { topicLabel } from "$lib/topic-label";
  import type { Topic } from "$lib/types";

  let { topic }: { topic: Topic } = $props();
  let dot = $state<HTMLButtonElement>();
  let popover = $state<HTMLElement>();

  /** Shows the popover beside the dot. It lives in the top layer, so the rail can't clip it. */
  function show() {
    if (!dot || !popover) return;
    const rect = dot.getBoundingClientRect();
    popover.style.top = `${rect.top + rect.height / 2}px`;
    popover.style.left = `${rect.right + 6}px`;
    popover.showPopover();
  }

  function hide() {
    popover?.hidePopover();
  }
</script>

<!----------------------------------------------------------------------------->

<button
  bind:this={dot}
  class="dot"
  class:current={topic.id === store.data.currentTopicId}
  class:resolved={topic.resolution?.state === "active"}
  onclick={() => selectTopic(topic.id)}
  onmouseenter={show}
  onmouseleave={hide}
  onfocus={show}
  onblur={hide}
  aria-label={topicLabel(topic)}
>
  <span></span>
</button>
<div bind:this={popover} popover="manual" class="popover">
  {topicLabel(topic)}
</div>

<!----------------------------------------------------------------------------->

<style>
  .dot {
    display: grid;
    place-items: center;
    width: 28px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: none;
  }

  .dot:hover {
    background: var(--bg-hover);
  }

  span {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--dot-inactive);
  }

  .current span {
    background: var(--accent);
  }

  /* A resolved context reads as settled even in the collapsed rail. */
  .resolved:not(.current) span {
    background: none;
    box-shadow: inset 0 0 0 2px var(--accent);
  }

  .popover {
    position: fixed;
    inset: auto;
    margin: 0;
    transform: translateY(-50%);
    max-width: 260px;
    padding: 4px 9px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-raised);
    color: var(--text);
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  }
</style>
