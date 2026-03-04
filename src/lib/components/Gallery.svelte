<script lang="ts">
import { langName } from '$lib/data/lang-names'
import type { Authors, VerbSets } from '$lib/data/types'
import VerbCard from './VerbCard.svelte'

const {
  sets,
  authors,
  preferredLang = '',
}: { sets: VerbSets; authors: Authors; preferredLang?: string } = $props()

const langs = $derived(
  Object.keys(sets).sort((a, b) => {
    if (a === preferredLang) return -1
    if (b === preferredLang) return 1
    return langName(a).localeCompare(langName(b))
  }),
)
</script>

<div class="g">
  {#each langs as l}
    {@const items = sets[l] ?? []}
    {#if items.length > 0}
      <div class="row">
        <div class="lang">{langName(l)}</div>
        <div class="blocks">
          {#each items as s (s.name)}
            <VerbCard set={s} author={authors[s.github]} />
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>

<style>
  .g { display: flex; flex-direction: column; }
  .row { display: grid; grid-template-columns: 120px 1fr; border-bottom: 1px solid var(--border-subtle); }
  .row:first-child { border-top: 1px solid var(--border-subtle); }
  .lang { font: 700 0.75rem var(--mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; padding: 1.5rem 1rem 1.5rem 0; position: sticky; left: 0; }
  .blocks { display: flex; flex-wrap: wrap; gap: 1px; padding: 1rem 0; }
  @media (max-width: 640px) {
    .row { grid-template-columns: 1fr; }
    .lang { padding: 1rem 0 0.25rem; position: static; }
    .blocks { padding: 0.25rem 0 1rem; }
  }
</style>
