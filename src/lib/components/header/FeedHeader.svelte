<!-- Bar above the feed: harness, model and effort pickers, plus appearance and settings buttons. -->
<script lang="ts">
  import { HARNESSES } from '$lib/models';
  import { store, updateSettings } from '$lib/state/store.svelte';
  import type { Harness } from '$lib/types';
  import AppearanceToggle from './AppearanceToggle.svelte';
  import EffortPicker from './EffortPicker.svelte';
  import ModelPicker from './ModelPicker.svelte';

  let { onOpenSettings }: { onOpenSettings: () => void } = $props();
</script>

<header>
  <label>
    <span>Harness</span>
    <select
      value={store.data.settings.harness}
      onchange={(e) => updateSettings({ harness: e.currentTarget.value as Harness })}
    >
      {#each HARNESSES as harness (harness.id)}
        <option value={harness.id}>{harness.label}</option>
      {/each}
    </select>
  </label>
  <ModelPicker />
  <EffortPicker />
  <div class="actions">
    <AppearanceToggle />
    <button class="icon-button settings" onclick={onOpenSettings} title="Settings" aria-label="Settings">
      ⚙
    </button>
  </div>
</header>

<style>
  header {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid var(--border);
  }

  header :global(label) {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  header :global(label > span) {
    color: var(--text-muted);
  }

  .actions {
    display: flex;
    gap: 2px;
    margin-left: auto;
  }

  .settings {
    font-size: 16px;
  }
</style>
