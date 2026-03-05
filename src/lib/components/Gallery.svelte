<script lang="ts">
import { langName } from '$lib/data/lang-names'
import type { Authors, VerbSets } from '$lib/data/types'
import type { AppHandle } from '$lib/pixi/app'
import VerbCard from './VerbCard.svelte'

const {
  sets,
  authors,
  preferredLang = '',
  appHandle,
}: { sets: VerbSets; authors: Authors; preferredLang?: string; appHandle?: AppHandle } = $props()

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
            <VerbCard set={s} author={authors[s.github]} {appHandle} />
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>

<style>
  .g { display: flex; flex-direction: column; gap: 1.5rem; }
  .row { display: grid; grid-template-columns: 100px 1fr; gap: 0.75rem; align-items: start; }
  .lang { font: 700 0.75rem var(--mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; padding-top: 0.625rem; }
  .blocks { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1px; }
  @media (max-width: 640px) {
    .row { grid-template-columns: 1fr; }
    .lang { padding-top: 0; }
  }
</style>
