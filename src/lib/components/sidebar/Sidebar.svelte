<!-- Left sidebar: session picker and themes, or a rail of context dots on narrow windows. -->
<script lang="ts">
  import { compactLayout } from '$lib/layout';
  import DotRail from './DotRail.svelte';
  import SessionPicker from './SessionPicker.svelte';
  import ThemeList from './ThemeList.svelte';
</script>

<aside>
  {#if compactLayout.current}
    <DotRail />
  {:else}
    <SessionPicker />
    <ThemeList />
  {/if}
</aside>

<style>
  aside {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
  }
</style>
