<!-- Where to find each harness: the Claude CLI and its working folder, and the Ollama server. -->
<script lang="ts">
  import { claudeStatus } from '$lib/ipc/system';
  import { refreshOllamaModels, ollama } from '$lib/state/ollama.svelte';
  import { store, updateSettings } from '$lib/state/store.svelte';

  const settings = $derived(store.data.settings);
  let cliStatus = $state('Checking…');

  $effect(() => {
    claudeStatus(settings.claudePath)
      .then((version) => (cliStatus = `✓ ${version}`))
      .catch((err) => (cliStatus = `✗ ${err}`));
  });

  function setOllamaUrl(url: string) {
    updateSettings({ ollamaUrl: url.trim() });
    void refreshOllamaModels();
  }
</script>

<fieldset>
  <legend>Claude</legend>
  <label>
    CLI path
    <input
      type="text"
      value={settings.claudePath}
      placeholder="Auto-detect"
      onchange={(e) => updateSettings({ claudePath: e.currentTarget.value.trim() })}
    />
  </label>
  <p class="note">{cliStatus}</p>
  <label>
    Working folder
    <input
      type="text"
      value={settings.claudeCwd}
      placeholder={store.workspace}
      onchange={(e) => updateSettings({ claudeCwd: e.currentTarget.value.trim() })}
    />
  </label>
</fieldset>

<fieldset>
  <legend>Ollama</legend>
  <label>
    Server URL
    <input type="text" value={settings.ollamaUrl} onchange={(e) => setOllamaUrl(e.currentTarget.value)} />
  </label>
  <p class="note">
    {ollama.error ? `✗ ${ollama.error}` : `✓ ${ollama.models.length} models available`}
  </p>
</fieldset>
