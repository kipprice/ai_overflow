<!-- Root layout: loads the bundled fonts and global styles. -->
<script lang="ts">
  import '@fontsource/lato/400.css';
  import '@fontsource/lato/400-italic.css';
  import '@fontsource/lato/700.css';
  import '@fontsource/lekton/400.css';
  import '@fontsource/lekton/700.css';
  import type { Snippet } from 'svelte';
  import '../app.css';

  let { children }: { children: Snippet } = $props();
</script>

{@render children()}
