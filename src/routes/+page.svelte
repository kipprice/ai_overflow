<!-- App shell: loads saved data, then lays out the sidebar, feed and composer. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Composer from '$lib/components/composer/Composer.svelte';
  import Feed from '$lib/components/feed/Feed.svelte';
  import FeedHeader from '$lib/components/header/FeedHeader.svelte';
  import SettingsDialog from '$lib/components/settings/SettingsDialog.svelte';
  import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
  import { resolveTheme } from '$lib/appearance';
  import { compactLayout } from '$lib/layout';
  import { refreshOllamaModels } from '$lib/state/ollama.svelte';
  import { loadStore, store } from '$lib/state/store.svelte';
  import { resumePendingThemes } from '$lib/state/naming';

  let settingsOpen = $state(false);

  $effect(() => {
    document.documentElement.dataset.theme = resolveTheme(store.data.settings.appearance);
  });

  onMount(async () => {
    await loadStore();
    resumePendingThemes();
    void refreshOllamaModels();
  });
</script>

{#if store.loadError}
  <p class="load-error">Could not load your saved feed: {store.loadError}</p>
{:else if store.loaded}
  <div class="app" class:compact={compactLayout.current}>
    <Sidebar />
    <main>
      <FeedHeader onOpenSettings={() => (settingsOpen = true)} />
      <Feed />
      <Composer />
    </main>
  </div>
  <SettingsDialog bind:open={settingsOpen} />
{/if}

<style>
  .app {
    display: grid;
    grid-template-columns: 220px 1fr;
    height: 100vh;
  }

  .app.compact {
    grid-template-columns: 44px 1fr;
  }

  main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .load-error {
    padding: 24px;
    color: var(--danger);
  }
</style>
