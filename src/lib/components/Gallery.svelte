<script lang="ts">
import { langName } from '$lib/data/lang-names'
import type { Authors, VerbSet, VerbSets } from '$lib/data/types'
import VerbCard from './VerbCard.svelte'

const {
  sets,
  authors,
  preferredLang = '',
}: { sets: VerbSets; authors: Authors; preferredLang?: string } = $props()

type SortKey = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'most-verbs' | 'fewest-verbs'
const sortOpts: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'a-z', label: 'A → Z' },
  { key: 'z-a', label: 'Z → A' },
  { key: 'most-verbs', label: 'Most verbs' },
  { key: 'fewest-verbs', label: 'Fewest verbs' },
]

// biome-ignore lint/style/useConst: svelte $state requires let for reactive reassignment
let lang = $state('all')
let sort: SortKey = $state('newest')
let open = $state(false)

const langs = $derived(
  Object.keys(sets).sort((a, b) => {
    if (a === preferredLang) return -1
    if (b === preferredLang) return 1
    return langName(a).localeCompare(langName(b))
  }),
)
const all = $derived(langs.flatMap((l) => sets[l] ?? []))
const filtered: VerbSet[] = $derived(lang === 'all' ? all : (sets[lang] ?? []))

function cmp(a: VerbSet, b: VerbSet): number {
  switch (sort) {
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

const sorted = $derived([...filtered].sort(cmp))
const sortLabel = $derived(sortOpts.find((o) => o.key === sort)?.label ?? 'Sort')
function pick(k: SortKey) {
  sort = k
  open = false
}
</script>

<div class="g">
  <div class="ctrl">
    <div class="flt" role="tablist" aria-label="Filter by language">
      <button class="fp" class:on={lang === 'all'} role="tab" aria-selected={lang === 'all'} onclick={() => (lang = 'all')}>
        <span>All</span><span class="fc">{all.length}</span>
      </button>
      {#each langs as l}
        {@const n = sets[l]?.length ?? 0}
        <button class="fp" class:on={lang === l} role="tab" aria-selected={lang === l} onclick={() => (lang = l)}>
          <span>{langName(l)}</span><span class="fc">{n}</span>
        </button>
      {/each}
    </div>
    <div class="srt">
      <button class="st" aria-haspopup="listbox" aria-expanded={open} onclick={() => (open = !open)} onblur={() => setTimeout(() => (open = false), 150)}>
        <span class="si">↕</span><span>{sortLabel}</span>
      </button>
      {#if open}
        <ul class="sm" role="listbox">
          {#each sortOpts as o}
            <li><button class="so" class:sel={sort === o.key} role="option" aria-selected={sort === o.key} onclick={() => pick(o.key)}>
              {#if sort === o.key}<span class="sc">›</span>{/if}{o.label}
            </button></li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <div class="sum">
    <span class="sn">{sorted.length}</span>
    <span class="sl">{sorted.length === 1 ? 'set' : 'sets'}</span>
    {#if lang !== 'all'}<span class="ss">in {langName(lang)}</span>{/if}
  </div>

  {#if sorted.length === 0}
    <div class="empty"><div class="eb"><span class="ei">∅</span><p class="et">No sets yet</p><p class="es">Be the first to contribute!</p></div></div>
  {:else}
    <div class="grid">{#each sorted as s (s.name)}<VerbCard set={s} author={authors[s.github]} />{/each}</div>
  {/if}
</div>

<style>
  .g { display: flex; flex-direction: column; gap: 1.5rem; }
  .ctrl { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .flt { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .fp { display: flex; align-items: center; gap: 0.5rem; font: 500 0.75rem var(--mono); color: var(--text-muted); background: transparent; border: 1px solid var(--border-subtle); padding: 0.5rem 0.875rem; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .fp:hover { color: var(--text); border-color: var(--border); }
  .fp.on { color: var(--accent); border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  .fc { font-weight: 400; font-size: 0.65rem; opacity: 0.6; }
  .srt { position: relative; flex-shrink: 0; }
  .st { display: flex; align-items: center; gap: 0.5rem; font: 500 0.72rem var(--mono); color: var(--text-muted); background: transparent; border: 1px solid var(--border-subtle); padding: 0.5rem 0.75rem; cursor: pointer; transition: all 0.15s; }
  .st:hover { color: var(--text); border-color: var(--border); }
  .si { font-size: 0.8rem; opacity: 0.6; }
  .sm { position: absolute; top: calc(100% + 0.5rem); right: 0; z-index: 100; min-width: 160px; background: var(--bg-surface); border: 1px solid var(--border); list-style: none; padding: 0.5rem 0; margin: 0; }
  .sm::before, .sm::after { position: absolute; color: var(--border); font-size: 0.75rem; line-height: 1; }
  .sm::before { content: '┌'; top: -1px; left: -1px; }
  .sm::after { content: '┘'; bottom: -1px; right: -1px; }
  .so { display: block; width: 100%; font: 500 0.72rem var(--mono); color: var(--text-muted); background: transparent; border: none; padding: 0.5rem 1rem 0.5rem 1.5rem; text-align: left; cursor: pointer; transition: all 0.1s; position: relative; }
  .so:hover { color: var(--text); background: var(--bg-raised); }
  .so.sel { color: var(--accent); }
  .sc { position: absolute; left: 0.625rem; color: var(--accent); }
  .sum { display: flex; align-items: baseline; gap: 0.35rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); }
  .sn { font: 700 1.5rem var(--display); color: var(--text); line-height: 1; }
  .sl { font: 400 0.75rem var(--mono); color: var(--text-muted); }
  .ss { font: 400 0.75rem var(--mono); color: var(--text-faint); margin-left: 0.25rem; }
  .empty { display: flex; justify-content: center; padding: 4rem 2rem; }
  .eb { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem 3rem; border: 1px dashed var(--border); text-align: center; }
  .ei { font-size: 2rem; color: var(--text-faint); opacity: 0.5; }
  .et { font: 600 0.85rem var(--mono); color: var(--text-muted); margin: 0; }
  .es { font: 400 0.75rem var(--mono); color: var(--text-faint); margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
  @media (max-width: 768px) {
    .ctrl { flex-direction: column; gap: 1rem; }
    .flt { width: 100%; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 0.5rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
    .flt::-webkit-scrollbar { display: none; }
    .srt { align-self: flex-end; }
    .grid { grid-template-columns: 1fr; gap: 1rem; }
  }
</style>
