<!-- Compact sidebar for narrow windows: a new-session button and one dot per context. -->
<script lang="ts">
  import { startSession } from "$lib/state/sessions";
  import { sessionTopics } from "$lib/state/topics";
  import ThemeDot from "./ThemeDot.svelte";

  const topics = $derived(sessionTopics());
</script>

<!----------------------------------------------------------------------------->

<button
  class="icon-button new"
  onclick={startSession}
  title="New session"
  aria-label="New session">+</button
>
<nav>
  {#each topics as topic (topic.id)}
    <ThemeDot {topic} />
  {/each}
</nav>

<!----------------------------------------------------------------------------->

<style>
  .new {
    margin: 10px auto 6px;
    font-size: 18px;
    line-height: 1;
    padding: 2px 8px;
  }

  nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }
</style>
