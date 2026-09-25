<!-- Inline text field for renaming a context: Enter or blur saves, Escape cancels. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { renameTopic } from '$lib/state/naming';
  import { topicLabel } from '$lib/topic-label';
  import type { Topic } from '$lib/types';

  let { topic, onDone }: { topic: Topic; onDone: () => void } = $props();
  // Start from the current name; later changes to the topic shouldn't overwrite what's typed.
  let value = $state(untrack(() => topicLabel(topic)));
  let done = false;

  /** Saves (or discards) once, then leaves edit mode. */
  function finish(save: boolean) {
    if (done) return;
    done = true;
    if (save) renameTopic(topic, value);
    onDone();
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      finish(true);
    } else if (event.key === 'Escape') {
      // Keep Escape from reaching the window, where it would cancel a streaming answer.
      event.stopPropagation();
      finish(false);
    }
  }

  function selectAll(input: HTMLInputElement) {
    input.focus();
    input.select();
  }
</script>

<input
  type="text"
  bind:value
  {onkeydown}
  onblur={() => finish(true)}
  use:selectAll
  aria-label="Context name"
/>

<style>
  input {
    flex: 1;
    min-width: 0;
    margin: 1px 2px;
    padding: 4px 6px;
    border: 1px solid var(--accent);
    border-radius: 5px;
    background: var(--bg-raised);
    color: var(--text);
    outline: none;
  }
</style>
