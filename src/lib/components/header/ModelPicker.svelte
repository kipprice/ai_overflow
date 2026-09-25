<!-- Model picker for the selected harness: the Claude catalogue, or installed Ollama models. -->
<script lang="ts">
  import { CLAUDE_MODELS } from '$lib/models';
  import { ollama, refreshOllamaModels } from '$lib/state/ollama.svelte';
  import { store, updateSettings } from '$lib/state/store.svelte';

  const settings = $derived(store.data.settings);
</script>

<label>
  <span>Model</span>
  {#if settings.harness === 'claude'}
    <select value={settings.claudeModel} onchange={(e) => updateSettings({ claudeModel: e.currentTarget.value })}>
      {#each CLAUDE_MODELS as model (model.id)}
        <option value={model.id}>{model.label}</option>
      {/each}
    </select>
  {:else if ollama.models.length}
    <select value={settings.ollamaModel} onchange={(e) => updateSettings({ ollamaModel: e.currentTarget.value })}>
      {#each ollama.models as model (model)}
        <option value={model}>{model}</option>
      {/each}
    </select>
  {:else}
    <em class="error" title={ollama.error}>Ollama unavailable</em>
  {/if}
  {#if settings.harness === 'ollama'}
    <button class="icon-button" onclick={refreshOllamaModels} title="Reload Ollama models">↻</button>
  {/if}
</label>

<style>
  .error {
    color: var(--danger);
  }
</style>
