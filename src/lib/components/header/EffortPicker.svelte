<!-- Effort picker, shown only when the selected model supports an effort level. -->
<script lang="ts">
  import { currentEffort, effortKey, effortOptions } from "$lib/state/effort";
  import { loadCapabilities } from "$lib/state/ollama.svelte";
  import { store, updateSettings } from "$lib/state/store.svelte";

  const options = $derived(effortOptions());

  // Ollama capabilities are fetched lazily, the first time a model is selected.
  $effect(() => {
    if (store.data.settings.harness === "ollama")
      void loadCapabilities(store.data.settings.ollamaModel);
  });

  // Drop an effort the newly selected model doesn't support (once its capabilities are known).
  $effect(() => {
    const effort = currentEffort();
    if (options && effort && !options.includes(effort))
      updateSettings({ [effortKey()]: "" });
  });
</script>

<!----------------------------------------------------------------------------->

{#if options?.length}
  <label>
    <span>Effort</span>
    <select
      value={currentEffort()}
      onchange={(e) => updateSettings({ [effortKey()]: e.currentTarget.value })}
    >
      <option value="">Default</option>
      {#each options as option (option)}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </label>
{/if}
