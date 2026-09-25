<!-- The current session's contexts, newest first, listed by theme; clicking one opens it. -->
<script lang="ts">
  import { sessionTopics } from '$lib/state/topics';
  import ThemeItem from './ThemeItem.svelte';

  const topics = $derived(sessionTopics());
</script>

<nav>
  {#each topics as topic (topic.id)}
    <ThemeItem {topic} />
  {:else}
    <p class="empty">Each question you ask starts a theme here. <code>/clear</code> starts a new one.</p>
  {/each}
</nav>

<style>
  nav {
    flex: 1;
    overflow-y: auto;
    padding: 8px 6px;
  }

  .empty {
    padding: 4px 8px;
    color: var(--text-muted);
    font-size: 12px;
  }
</style>
