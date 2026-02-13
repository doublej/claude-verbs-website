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

type SortKey = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'most-verbs' | 'fewest-verbs'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'a-z', label: 'A\u2009\u2192\u2009Z' },
  { key: 'most-verbs', label: 'Most verbs' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'z-a', label: 'Z\u2009\u2192\u2009A' },
  { key: 'fewest-verbs', label: 'Fewest verbs' },
]

// biome-ignore lint/style/useConst: svelte $state requires let for reassignment
let selectedLang = $state('all')
// biome-ignore lint/style/useConst: svelte $state requires let for reassignment
let sortKey: SortKey = $state('newest')

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

function compareBySort(a: VerbSet, b: VerbSet): number {
  switch (sortKey) {
    case 'newest':
      return (b.createdAt || '').localeCompare(a.createdAt || '')
    case 'oldest':
      return (a.createdAt || '').localeCompare(b.createdAt || '')
    case 'a-z':
      return a.displayName.localeCompare(b.displayName)
    case 'z-a':
      return b.displayName.localeCompare(a.displayName)
    case 'most-verbs':
      return b.verbCount - a.verbCount
    case 'fewest-verbs':
      return a.verbCount - b.verbCount
  }
}

const sortedSets = $derived([...filteredSets].sort(compareBySort))
</script>

<div class="controls">
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

  <div class="sort-bar" role="group" aria-label="Sort order">
    <span class="sort-label" aria-hidden="true">sort:</span>
    {#each sortOptions as opt}
      <button
        class="sort-btn"
        class:sort-btn--active={sortKey === opt.key}
        aria-pressed={sortKey === opt.key}
        onclick={() => (sortKey = opt.key)}
      >{opt.label}</button>
    {/each}
  </div>
</div>

{#if sortedSets.length === 0}
  <p class="empty">No sets yet -- be the first to contribute!</p>
{:else}
  <div class="cards">
    {#each sortedSets as set (set.name)}
      <VerbCard {set} author={authors[set.github]} />
    {/each}
  </div>
{/if}

<style>
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 2rem;
  }

  .pill-bar {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
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

  .sort-bar {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    align-self: flex-end;
    padding-top: 0.35rem;
    border-top: 1px solid color-mix(in srgb, var(--border) 30%, transparent);
  }

  .sort-label {
    font: 400 0.66rem var(--mono);
    color: var(--text-faint);
    margin-right: 0.15rem;
    text-transform: lowercase;
  }

  .sort-btn {
    font: 400 0.66rem var(--mono);
    color: var(--text-faint);
    background: none;
    border: none;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    transition: color 0.15s;
    white-space: nowrap;
    position: relative;
  }

  .sort-btn:hover {
    color: var(--text);
  }

  .sort-btn--active {
    color: var(--accent);
    font-weight: 700;
  }

  .sort-btn--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0.5rem;
    right: 0.5rem;
    height: 1px;
    background: var(--accent);
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
    .sort-bar {
      align-self: stretch;
      flex-wrap: wrap;
    }

    .cards {
      grid-template-columns: 1fr;
    }
  }
</style>
