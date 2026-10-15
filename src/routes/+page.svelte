<!-- App shell: loads saved data, then lays out the sidebar, feed and composer. -->
<script lang="ts">
  import { resolveTheme } from "$lib/appearance";
  import Feed from "$lib/components/feed/Feed.svelte";
  import FeedHeader from "$lib/components/header/FeedHeader.svelte";
  import FeedFooter from "$lib/components/resolution/FeedFooter.svelte";
  import SettingsDialog from "$lib/components/settings/SettingsDialog.svelte";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import { compactLayout } from "$lib/layout";
  import { resumePendingThemes } from "$lib/state/naming";
  import { refreshOllamaModels } from "$lib/state/ollama.svelte";
  import { resumePendingSummaries } from "$lib/state/resolution-summary";
  import { loadStore, store } from "$lib/state/store.svelte";
  import { resumePendingTags } from "$lib/state/tagging";
  import { onMount } from "svelte";

  let settingsOpen = $state(false);

  $effect(() => {
    document.documentElement.dataset.theme = resolveTheme(
      store.data.settings.appearance,
    );
  });

  onMount(async () => {
    await loadStore();
    resumePendingThemes();
    resumePendingTags();
    resumePendingSummaries();
    void refreshOllamaModels();
  });
</script>

<!----------------------------------------------------------------------------->

{#if store.loadError}
  <p class="load-error">Could not load your saved feed: {store.loadError}</p>
{:else if store.loaded}
  <div class="app" class:compact={compactLayout.current}>
    <Sidebar />
    <main>
      <FeedHeader onOpenSettings={() => (settingsOpen = true)} />
      <Feed />
      <FeedFooter />
    </main>
  </div>
  <SettingsDialog bind:open={settingsOpen} />
{/if}

<!----------------------------------------------------------------------------->

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
