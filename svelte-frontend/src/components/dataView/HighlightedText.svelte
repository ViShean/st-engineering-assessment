<!-- src/lib/components/dataView/HighlightedText.svelte -->
<script lang="ts">
  interface Props {
    text: string;
    highlight?: string;
  }

  let { text, highlight }: Props = $props();

  let parts = $derived.by(() => {
    if (!highlight?.trim()) return [{ text, isMatch: false }];
    return text
      .split(new RegExp(`(${highlight})`, 'gi'))
      .map((part) => ({
        text: part,
        isMatch: part.toLowerCase() === highlight!.toLowerCase()
      }));
  });
</script>

{#each parts as part}
  {#if part.isMatch}
    <mark class="bg-amber-200/80 text-amber-900 rounded font-semibold">
      {part.text}
    </mark>
  {:else}
    {part.text}
  {/if}
{/each}