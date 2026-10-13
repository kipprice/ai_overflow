<!-- Header button that cycles the colour scheme: System → Light → Dark. -->
<script lang="ts">
  import { nextAppearance } from "$lib/appearance";
  import { store, updateSettings } from "$lib/state/store.svelte";
  import type { Appearance } from "$lib/types";

  const ICONS: Record<Appearance, string> = {
    system: "◐",
    light: "☀",
    dark: "☾",
  };
  const NAMES: Record<Appearance, string> = {
    system: "System",
    light: "Light",
    dark: "Dark",
  };

  const current = $derived(store.data.settings.appearance);
  const next = $derived(nextAppearance(current));
</script>

<!----------------------------------------------------------------------------->

<button
  class="icon-button"
  onclick={() => updateSettings({ appearance: next })}
  title="Appearance: {NAMES[current]} (click for {NAMES[next]})"
  aria-label="Appearance: {NAMES[current]}"
>
  {ICONS[current]}
</button>

<!----------------------------------------------------------------------------->

<style>
  button {
    font-size: 16px;
  }
</style>
