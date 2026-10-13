<!-- The body of a resolution, shown wherever one appears: what it says, in full, plus the
     answer text it came from when a summary is standing in for that text. -->
<script lang="ts">
  import type { Resolution } from "$lib/types";

  let { resolution }: { resolution: Resolution } = $props();

  const waiting = $derived(resolution.summaryStatus === "pending");
  const headline = $derived(headlineFor(resolution));
  // Worth showing on its own only when the headline is a summary, not the text itself. Only
  // an accepted answer is summarised; the user's own words stand as they were written.
  const excerpt = $derived(
    resolution.source === "accepted" && resolution.summary
      ? resolution.text
      : "",
  );

  /** What the resolution says, falling back to the accepted text when no summary stands. */
  function headlineFor(r: Resolution): string {
    if (r.summaryStatus === "pending") return "Summarising the resolution…";
    return r.summary || r.text || "Marked resolved, with no note.";
  }
</script>

<!----------------------------------------------------------------------------->

<p class="headline" class:waiting>{headline}</p>
{#if excerpt}
  <details>
    <summary>Accepted from the answer</summary>
    <blockquote>{excerpt}</blockquote>
  </details>
{/if}

<!----------------------------------------------------------------------------->

<style>
  /* Wraps rather than truncates: a resolution is the answer, so all of it shows. */
  .headline {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .waiting {
    font-style: italic;
    opacity: 0.8;
  }

  details {
    margin-top: 8px;
    font-size: 12.5px;
  }

  summary {
    cursor: pointer;
    opacity: 0.8;
  }

  blockquote {
    margin: 6px 0 0;
    padding-left: 10px;
    border-left: 2px solid color-mix(in srgb, currentColor 35%, transparent);
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
