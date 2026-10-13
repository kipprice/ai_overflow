<!-- Chooses which harness and model handle the cheap helper calls: naming a context, and
     summarising an answer accepted as a resolution. -->
<script lang="ts">
  import { CLAUDE_MODELS, HARNESSES } from "$lib/models";
  import { ollama } from "$lib/state/ollama.svelte";
  import { store, updateSettings } from "$lib/state/store.svelte";
  import type { Harness } from "$lib/types";

  const settings = $derived(store.data.settings);
</script>

<!----------------------------------------------------------------------------->

<fieldset>
  <legend>Helper model</legend>
  <p class="note">
    A cheap model that labels each context with a short theme, and sums up in
    one line the answers you accept as resolutions.
  </p>
  <label>
    Harness
    <select
      value={settings.themeHarness}
      onchange={(e) =>
        updateSettings({ themeHarness: e.currentTarget.value as Harness })}
    >
      {#each HARNESSES as harness (harness.id)}
        <option value={harness.id}>{harness.label}</option>
      {/each}
    </select>
  </label>
  <label>
    Model
    {#if settings.themeHarness === "claude"}
      <select
        value={settings.themeClaudeModel}
        onchange={(e) =>
          updateSettings({ themeClaudeModel: e.currentTarget.value })}
      >
        {#each CLAUDE_MODELS as model (model.id)}
          <option value={model.id}>{model.label}</option>
        {/each}
      </select>
    {:else}
      <select
        value={settings.themeOllamaModel}
        onchange={(e) =>
          updateSettings({ themeOllamaModel: e.currentTarget.value })}
      >
        {#each ollama.models as model (model)}
          <option value={model}>{model}</option>
        {:else}
          <option value="" disabled>No Ollama models found</option>
        {/each}
      </select>
    {/if}
  </label>
</fieldset>
