<script lang="ts">
import { langName } from '$lib/data/lang-names'
import type { Authors, VerbSets } from '$lib/data/types'
import type { VerbSet } from '$lib/data/types'
import VerbCard from './VerbCard.svelte'

const {
  sets,
  authors,
  preferredLang = '',
}: { sets: VerbSets; authors: Authors; preferredLang?: string } = $props()

// biome-ignore lint/style/useConst: svelte $state requires let for reassignment
let selectedLang = $state('all')

const languages = $derived(
  Object.keys(sets).sort((a, b) => {
    if (a === preferredLang) return -1
    if (b === preferredLang) return 1
    return langName(a).localeCompare(langName(b))
  }),
)

const allSets = $derived(languages.flatMap((lang) => sets[lang] ?? []))

const filteredSets: VerbSet[] = $derived(
  selectedLang === 'all' ? allSets : (sets[selectedLang] ?? []),
)
</script>

<div class="pill-bar" role="tablist" aria-label="Filter by language">
  <button
    class="pill"
    class:pill--active={selectedLang === 'all'}
    role="tab"
    aria-selected={selectedLang === 'all'}
    onclick={() => (selectedLang = 'all')}
  >All</button>
  {#each languages as lang}
    <button
      class="pill"
      class:pill--active={selectedLang === lang}
      role="tab"
      aria-selected={selectedLang === lang}
      onclick={() => (selectedLang = lang)}
    >{langName(lang)}</button>
  {/each}
</div>

{#if filteredSets.length === 0}
  <p class="empty">No sets yet -- be the first to contribute!</p>
{:else}
  <div class="cards">
    {#each filteredSets as set (set.name)}
      <VerbCard {set} author={authors[set.github]} />
    {/each}
  </div>
{/if}

<style>
  .pill-bar {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-bottom: 2rem;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  .pill-bar::-webkit-scrollbar { height: 4px; }
  .pill-bar::-webkit-scrollbar-track { background: transparent; }
  .pill-bar::-webkit-scrollbar-thumb { background: var(--border); }

  .pill {
    flex-shrink: 0;
    font: 700 0.72rem var(--mono);
    color: var(--text-muted);
    background: none;
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    padding: 0.4rem 1rem;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
    white-space: nowrap;
  }

  .pill:hover {
    color: var(--text);
    border-color: var(--border);
  }

  .pill--active {
    color: var(--accent);
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .empty {
    color: var(--text-faint);
    font-size: 0.82rem;
    font-style: italic;
    padding: 1.5rem;
    text-align: center;
    border: 1px dashed color-mix(in srgb, var(--border) 50%, transparent);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1px;
    border: 1px solid color-mix(in srgb, var(--border) 30%, transparent);
  }

  @media (max-width: 600px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }
</style>
