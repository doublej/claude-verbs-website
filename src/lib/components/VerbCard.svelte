<script lang="ts">
import type { Author, VerbSet } from '$lib/data/types'

const { set, author }: { set: VerbSet; author: Author | undefined } = $props()
const cmd = $derived(`bunx github:doublej/claude-verbs-cli install ${set.name}`)

let copied = $state(false)

function copy(e: MouseEvent) {
  e.stopPropagation()
  navigator.clipboard.writeText(cmd)
  copied = true
  setTimeout(() => {
    copied = false
  }, 1500)
}
</script>

<article class="c">
  <div class="top">
    <span class="nm">{set.displayName}</span>
    <span class="meta">{set.verbCount} verbs · {set.author}</span>
  </div>
  <button class="btn" class:cp={copied} title="Copy install" onclick={copy}>
    {#if copied}✓{:else}$ install{/if}
  </button>
</article>

<style>
  .c { display: flex; align-items: center; gap: 0.75rem; border: 1px solid var(--border); padding: 0.625rem 0.875rem; font-family: var(--mono); background: var(--bg-surface); }
  .c:hover { border-color: var(--text); }
  .top { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
  .nm { font: 700 0.82rem var(--mono); color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { font: 400 0.65rem var(--mono); color: var(--text-muted); white-space: nowrap; }
  .btn { flex-shrink: 0; font: 600 0.65rem var(--mono); color: var(--text-muted); background: transparent; border: 1px solid var(--border); padding: 0.3rem 0.5rem; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn:hover, .btn.cp { color: var(--text); border-color: var(--text); }
</style>
