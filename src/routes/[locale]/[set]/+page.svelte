<script lang="ts">
import AuthorPopup from '$lib/components/AuthorPopup.svelte'
import { onMount } from 'svelte'
import type { PageData } from './$types'

const SPIN = ['|', '/', '-', '\\']
const { data }: { data: PageData } = $props()
const set = $derived(data.set)
const author = $derived(data.author)
const seo = $derived(data.seo)
const verbs = $derived(set.verbs.map((v) => v.replace(/^\s*I(?:[\u2019']m| am)\s+/i, '')))
const cmd = $derived(`bunx github:doublej/claude-verbs-cli install ${set.name}`)
const LIMIT = 12
const preview = $derived(verbs.slice(0, LIMIT))
const more = $derived(set.verbCount > preview.length)

let copied = $state(false)
let verb = $state('')
let spin = $state('|')

function copy() {
  navigator.clipboard.writeText(cmd)
  copied = true
  setTimeout(() => {
    copied = false
  }, 1500)
}

onMount(() => {
  const sh = [...verbs].sort(() => Math.random() - 0.5)
  verb = sh[0] ?? 'Thinking...'
  let vi = 0
  let si = 0
  const vt = setInterval(() => {
    vi = (vi + 1) % sh.length
    verb = sh[vi]
  }, 2200)
  const st = setInterval(() => {
    si = (si + 1) % SPIN.length
    spin = SPIN[si]
  }, 200)
  return () => {
    clearInterval(vt)
    clearInterval(st)
  }
})
</script>

<svelte:head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  <link rel="canonical" href={seo.canonicalUrl} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:type" content={seo.ogType} />
  <meta property="og:url" content={seo.ogUrl} />
  <meta property="og:image" content={seo.ogImageUrl} />
  <meta property="og:image:width" content={String(seo.ogImageWidth)} />
  <meta property="og:image:height" content={String(seo.ogImageHeight)} />
  <meta property="og:image:alt" content={seo.ogImageAlt} />
  <meta name="twitter:card" content={seo.twitterCard} />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  <meta name="twitter:image" content={seo.twitterImageUrl} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
</svelte:head>

<main class="page">
  <div class="fr">
    <nav class="nav"><a class="back" href="/{data.locale}#browse"><span class="arr">←</span><span>All sets</span></a></nav>
    <header class="hd">
      <div class="meta">
        <div class="auth">
          {#if author?.avatarUrl}<img class="av" src="{author.avatarUrl}&s=40" alt="" loading="lazy" />{/if}
          <a class="al" href="https://github.com/{set.github}" target="_blank" rel="noopener">{set.author}</a>
          {#if author}<AuthorPopup {author} />{/if}
        </div>
        <div class="stats"><span class="cnt">{set.verbCount}</span><span class="lbl">verbs</span></div>
      </div>
      <h1 class="name">{set.displayName}</h1>
      <p class="desc">{set.description}</p>
    </header>
    <div class="pv" aria-live="polite"><span class="sp">{spin}</span><span class="txt">{verb}</span><span class="cur"></span></div>
    <section class="inst">
      <h2 class="ih">Install</h2>
      <button class="cmd" onclick={copy} title="Copy install command">
        <span class="pr">$</span><span class="ct">{cmd}</span>
        <span class="ac">{#if copied}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>{:else}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>{/if}</span>
      </button>
    </section>
    <section class="vbs">
      <h2 class="vh">{more ? `Preview (${preview.length} of ${set.verbCount})` : 'All verbs'}</h2>
      <ol class="vl">{#each preview as v, i}<li class="vi"><span class="vn">{String(i + 1).padStart(2, '0')}</span><span class="vt">{v}</span></li>{/each}</ol>
      {#if more}<p class="vm">Install to unlock all {set.verbCount} verbs</p>{/if}
    </section>
  </div>
</main>

<style>
  :global(body) { font-family: var(--mono); background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }
  .page { min-height: 100vh; padding: 0 0 4rem; }
  .fr { max-width: var(--max-w); margin: 0 auto; padding: 0 1.5rem; }
  .nav { padding: 2rem 0; }
  .back { display: inline-flex; align-items: center; gap: 0.5rem; font: 500 0.78rem var(--mono); color: var(--text-faint); text-decoration: none; transition: color 0.15s; }
  .back:hover { color: var(--text); }
  .arr { font-size: 1rem; transition: transform 0.15s; }
  .back:hover .arr { transform: translateX(-2px); }
  .hd { margin-bottom: 2rem; }
  .meta { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
  .auth { display: flex; align-items: center; gap: 0.5rem; position: relative; }
  .auth:hover :global(.author-popup) { display: block; }
  .av { width: 24px; height: 24px; opacity: 0.9; }
  .al { font: 400 0.78rem var(--mono); color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
  .al:hover { color: var(--accent); }
  .stats { display: flex; align-items: baseline; gap: 0.35rem; }
  .cnt { font: 700 1.5rem var(--display); color: var(--accent); line-height: 1; }
  .lbl { font: 400 0.72rem var(--mono); color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.05em; }
  .name { font: 700 clamp(1.5rem, 5vw, 2.5rem) var(--display); color: var(--text); margin-bottom: 0.5rem; line-height: 1.2; }
  .desc { font: 400 0.85rem var(--mono); color: var(--text-muted); line-height: 1.6; max-width: 560px; }
  .pv { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--bg-surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); padding: 0.875rem 1.25rem; margin-bottom: 2.5rem; font: 400 0.9rem var(--mono); }
  .sp { color: var(--accent); font-weight: 700; width: 1ch; text-align: center; }
  .txt { color: var(--text); }
  .cur { width: 0.5ch; height: 1.1em; background: var(--accent); animation: blink 1s step-end infinite; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .inst { margin-bottom: 2.5rem; }
  .ih { font: 600 0.72rem var(--mono); color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; }
  .cmd { display: flex; align-items: center; gap: 0.75rem; width: 100%; max-width: 600px; background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 1rem 1.25rem; font: 400 0.85rem var(--mono); color: var(--text); cursor: pointer; text-align: left; transition: border-color 0.15s; }
  .cmd:hover { border-color: var(--accent); }
  .pr { color: var(--accent); font-weight: 700; flex-shrink: 0; }
  .ct { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ac { flex-shrink: 0; color: var(--text-faint); display: flex; transition: color 0.15s; }
  .cmd:hover .ac { color: var(--accent); }
  .vbs { max-width: 600px; }
  .vh { font: 600 0.72rem var(--mono); color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; }
  .vl { list-style: none; margin: 0; padding: 0; border: 1px solid var(--border-subtle); }
  .vi { display: flex; align-items: baseline; gap: 1rem; padding: 0.625rem 1rem; font: 400 0.82rem var(--mono); color: var(--text-muted); border-bottom: 1px solid var(--border-subtle); transition: background-color 0.1s; }
  .vi:last-child { border-bottom: none; }
  .vi:hover { background: var(--bg-raised); }
  .vn { font: 400 0.7rem var(--mono); color: var(--text-faint); font-variant-numeric: tabular-nums; flex-shrink: 0; width: 2ch; }
  .vt { flex: 1; }
  .vm { margin-top: 1rem; font: 400 0.78rem var(--mono); color: var(--text-faint); font-style: italic; }
  @media (max-width: 640px) { .nav { padding: 1.5rem 0; } .meta { flex-direction: column; align-items: flex-start; gap: 0.75rem; } .pv { display: flex; width: 100%; } .cmd { padding: 0.875rem 1rem; } }
</style>
