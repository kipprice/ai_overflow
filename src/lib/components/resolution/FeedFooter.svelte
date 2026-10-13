<!-- The bottom of the pane: normally the composer, but a resolved question's resolution in
     its place, since such a context takes no more questions until it is reopened or forked. -->
<script lang="ts">
  import Composer from "$lib/components/composer/Composer.svelte";
  import { turn } from "$lib/state/chat.svelte";
  import {
    activeResolution,
    editOwnAnswer,
    reopenResolution,
  } from "$lib/state/resolution-state";
  import { currentTopic, forkContext, newContext } from "$lib/state/topics";
  import FooterNotice from "./FooterNotice.svelte";
  import ResolutionBar from "./ResolutionBar.svelte";

  const topic = $derived(currentTopic());
  // An answer accepted mid-stream mustn't take away the composer, which is what cancels the
  // turn in flight; the resolution takes over once it has finished.
  const resolution = $derived(
    turn.requestId ? undefined : activeResolution(topic),
  );
</script>

<!----------------------------------------------------------------------------->

{#if topic && resolution}
  <ResolutionBar
    {resolution}
    onNew={newContext}
    onReopen={() => reopenResolution(topic)}
    onFork={() => forkContext(topic)}
    onEditNote={(note) => editOwnAnswer(topic, note)}
  />
  <div class="notice"><FooterNotice /></div>
{:else}
  <Composer />
{/if}

<!----------------------------------------------------------------------------->

<style>
  /* Aligned with the resolution block above it, which carries the same side padding. */
  .notice {
    padding: 0 24px 8px;
  }
</style>
