<script lang="ts">
import type { Author, VerbSet } from '$lib/data/types'
import { onMount } from 'svelte'
import AuthorPopup from './AuthorPopup.svelte'

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const { set, author }: { set: VerbSet; author: Author | undefined } = $props()
const verbs = $derived(set.verbs.map((v) => v.replace(/^\s*I(?:[\u2019']m| am)\s+/i, '')))
const cmd = $derived(`bunx github:doublej/claude-verbs-cli install ${set.name}`)

let copied = $state(false)
let linkCopied = $state(false)
let hovered = $state(false)
let verb = $state('')
let spin = $state('⠋')
let vTimer: ReturnType<typeof setInterval> | undefined
let sTimer: ReturnType<typeof setInterval> | undefined
let shuffled: string[] = []
let vi = 0
let si = 0

function copy(e: MouseEvent) {
  e.stopPropagation()
  navigator.clipboard.writeText(cmd)
  copied = true
  setTimeout(() => {
    copied = false
  }, 1500)
}

function copyLink(e: MouseEvent) {
  e.stopPropagation()
  navigator.clipboard.writeText(`${location.origin}/${set.language}/${set.name}/`)
  linkCopied = true
  setTimeout(() => {
    linkCopied = false
  }, 1500)
}

function start() {
  vTimer = setInterval(() => {
    vi = (vi + 1) % shuffled.length
    verb = shuffled[vi]
  }, 2000)
  sTimer = setInterval(() => {
    si = (si + 1) % SPINNER.length
    spin = SPINNER[si]
  }, 80)
}

function stop() {
  clearInterval(vTimer)
  clearInterval(sTimer)
  vTimer = undefined
  sTimer = undefined
}
function enter() {
  hovered = true
  start()
}
function leave() {
  hovered = false
  stop()
}

onMount(() => {
  shuffled = [...verbs].sort(() => Math.random() - 0.5)
  verb = shuffled[0] ?? 'Thinking...'
  return stop
})
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<article class="c" class:hovered onmouseenter={enter} onmouseleave={leave}>
  <header class="c-h">
    <div class="c-m"><span class="c-n">{set.verbCount}</span><span class="c-l">verbs</span></div>
    <div class="c-a">
      {#if author?.avatarUrl}<img class="av" src="{author.avatarUrl}&s=32" alt="" loading="lazy" />
      {:else}<span class="av-p">@</span>{/if}
      <a class="a-l" href="https://github.com/{set.github}" target="_blank" rel="noopener" onclick={(e) => e.stopPropagation()}>{set.author}</a>
      {#if author}<AuthorPopup {author} />{/if}
    </div>
  </header>
  <div class="c-b"><h3 class="nm">{set.displayName}</h3><p class="ds">{set.description}</p></div>
  <div class="pv" class:act={hovered} aria-live="polite">
    <span class="sp">{spin}</span><span class="vb">{verb}</span>
    {#if hovered}<span class="cu"></span>{/if}
  </div>
  <footer class="ac">
    <button class="btn pri" class:cp={copied} title="Copy install" onclick={copy}>
      {#if copied}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>Copied</span>
      {:else}<span class="pr">$</span><span>install</span>{/if}
    </button>
    <button class="btn ico" class:cp={linkCopied} title="Copy link" onclick={copyLink}>
      {#if linkCopied}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
      {:else}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>{/if}
    </button>
  </footer>
</article>

<style>
  .c { position: relative; background: var(--bg-surface); border: 1px solid var(--border-subtle); transition: border-color 0.15s; }
  .c::before, .c::after { position: absolute; color: var(--border-subtle); font-size: 0.75rem; line-height: 1; transition: color 0.15s; pointer-events: none; }
  .c::before { content: '┌'; top: -1px; left: -1px; }
  .c::after { content: '┘'; bottom: -1px; right: -1px; }
  .c:hover { border-color: var(--accent); }
  .c:hover::before, .c:hover::after { color: var(--accent); }
  .c > * { padding: 0 1.5rem; }
  .c-h { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-top: 1.5rem; padding-bottom: 0; }
  .c-m { display: flex; align-items: baseline; gap: 0.35rem; }
  .c-n { font: 700 1.25rem var(--display); color: var(--accent); line-height: 1; }
  .c-l { font: 400 0.65rem var(--mono); color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.05em; }
  .c-a { display: flex; align-items: center; gap: 0.5rem; position: relative; min-width: 0; }
  .c-a:hover :global(.author-popup) { display: block; }
  .av { width: 20px; height: 20px; flex-shrink: 0; opacity: 0.8; }
  .av-p { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; background: var(--bg-raised); border: 1px solid var(--border-subtle); font: 600 0.6rem var(--mono); color: var(--text-faint); flex-shrink: 0; }
  .a-l { font: 400 0.72rem var(--mono); color: var(--text-faint); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 0.15s; }
  .a-l:hover { color: var(--text); }
  .c-b { flex: 1; min-height: 0; padding-top: 1rem; padding-bottom: 0; }
  .nm { font: 700 1.1rem var(--display); color: var(--text); margin: 0 0 0.5rem; line-height: 1.3; transition: color 0.15s; }
  .c:hover .nm { color: var(--accent); }
  .ds { font: 400 0.78rem var(--mono); color: var(--text-muted); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .pv { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 1.5rem; padding: 0.75rem 1rem; background: var(--bg); border-left: 2px solid var(--border-subtle); font: 400 0.78rem var(--mono); min-height: 2.5rem; overflow: hidden; transition: border-color 0.15s, background 0.15s; }
  .pv.act { border-left-color: var(--accent); background: color-mix(in srgb, var(--accent) 4%, var(--bg)); }
  .sp { color: var(--text-faint); font-size: 0.9rem; width: 1ch; text-align: center; transition: color 0.15s; }
  .pv.act .sp { color: var(--accent); }
  .vb { color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.15s; }
  .pv.act .vb { color: var(--text); }
  .cu { width: 0.5ch; height: 1em; background: var(--accent); animation: blink 1s step-end infinite; flex-shrink: 0; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .ac { display: flex; gap: 0.5rem; padding-top: 0.75rem; padding-bottom: 1.5rem; border-top: 1px solid var(--border-subtle); margin-top: 0; }
  .btn { display: flex; align-items: center; justify-content: center; gap: 0.4rem; font: 600 0.72rem var(--mono); color: var(--text-muted); background: transparent; border: 1px solid var(--border-subtle); padding: 0.5rem 0.875rem; cursor: pointer; transition: all 0.15s; }
  .btn:hover, .btn.cp { color: var(--accent); border-color: var(--accent); }
  .pri { flex: 1; }
  .ico { padding: 0.5rem; aspect-ratio: 1; }
  .pr { color: var(--accent); font-weight: 700; }
</style>
