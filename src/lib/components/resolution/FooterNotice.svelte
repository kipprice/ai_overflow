<!-- The one-line notice under a resolved context. The composer normally carries these in
     place of its keyboard hints, but a resolved context has no composer, so without this a
     copy confirmation — or the error explaining why a copy failed — would never be seen. -->
<script lang="ts">
  import { notice } from "$lib/state/notice.svelte";
</script>

<!----------------------------------------------------------------------------->

{#if notice.text}
  <p>{notice.text}</p>
{/if}

<!----------------------------------------------------------------------------->

<style>
  /* Matches the composer's hint line, so a notice sits in the same place either way. */
  p {
    max-width: 820px;
    margin: 4px auto 0;
    font-size: 11px;
    color: var(--text-muted);
  }
</style>
