<script lang="ts">
import { langName } from '$lib/data/lang-names'
import type { Authors, VerbSets } from '$lib/data/types'
import VerbCard from './VerbCard.svelte'

const { sets, authors }: { sets: VerbSets; authors: Authors } = $props()

const sortedLangs = $derived(
  Object.keys(sets).sort((a, b) => langName(a).localeCompare(langName(b))),
)
</script>

{#each sortedLangs as lang}
  <div class="lang-group">
    <h3 class="lang-group__title">{langName(lang)}</h3>
    {#if !sets[lang] || sets[lang].length === 0}
      <p class="lang-group__empty">No sets yet -- be the first to contribute!</p>
    {:else}
      <div class="cards">
        {#each sets[lang] as set}
          <VerbCard {set} author={authors[set.github]} />
        {/each}
      </div>
    {/if}
  </div>
{/each}

<style>
  .lang-group {
    margin-bottom: 3rem;
  }

  .lang-group__title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--cyan);
    margin-bottom: 1rem;
    padding-bottom: 0.4rem;
  }

  .lang-group__title::before {
    content: '## ';
    color: var(--text-faint);
  }

  .lang-group__empty {
    color: var(--text-faint);
    font-size: 0.82rem;
    font-style: italic;
    padding: 1.5rem;
    text-align: center;
    border: 1px dashed color-mix(in srgb, var(--border) 50%, transparent);
    border-radius: 6px;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 600px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }
</style>
