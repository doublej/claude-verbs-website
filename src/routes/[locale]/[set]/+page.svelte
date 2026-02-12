<script lang="ts">
import AuthorPopup from '$lib/components/AuthorPopup.svelte'
import { onMount } from 'svelte'
import type { PageData } from './$types'

const SPINNER_CHARS = ['|', '/', '-', '\\']

const { data }: { data: PageData } = $props()

const set = $derived(data.set)
const author = $derived(data.author)
const normalizedVerbs = $derived(set.verbs.map((v) => v.replace(/^\s*I(?:[\u2019']m| am)\s+/i, '')))
const installCmd = $derived(`bunx github:doublej/claude-verbs-cli install ${set.name}`)
const hasMore = $derived(set.verbCount > normalizedVerbs.length)

let copied = $state(false)
let currentVerb = $state('')
let spinnerChar = $state('|')

function copyInstallCmd() {
  navigator.clipboard.writeText(installCmd)
  copied = true
  setTimeout(() => {
    copied = false
  }, 1500)
}

onMount(() => {
  const shuffled = [...normalizedVerbs]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  currentVerb = shuffled[0] ?? 'Thinking...'

  let verbIdx = 0
  let charIdx = 0
  const verbTimer = setInterval(() => {
    verbIdx = (verbIdx + 1) % shuffled.length
    currentVerb = shuffled[verbIdx]
  }, 2200)
  const charTimer = setInterval(() => {
    charIdx = (charIdx + 1) % SPINNER_CHARS.length
    spinnerChar = SPINNER_CHARS[charIdx]
  }, 200)

  return () => {
    clearInterval(verbTimer)
    clearInterval(charTimer)
  }
})
</script>

<svelte:head>
  <title>{set.displayName} — Claude Verbs</title>
  <meta name="description" content="{set.description} — {set.verbCount} themed spinner verbs for Claude Code." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
</svelte:head>

<main class="detail">
  <div class="container">
    <a class="back" href="/{data.locale}/marketplace">&#8592; all sets</a>

    <h1 class="detail__name">{set.displayName}</h1>
    <p class="detail__desc">{set.description}</p>

    <div class="detail__meta">
      <span class="detail__author">
        {#if author?.avatarUrl}
          <img class="detail__avatar" src="{author.avatarUrl}&s=40" alt="" loading="lazy" />
        {/if}
        <a class="detail__author-link" href="https://github.com/{set.github}" target="_blank" rel="noopener">{set.author}</a>
        {#if author}
          <AuthorPopup {author} />
        {/if}
      </span>
      <span>{set.verbCount} verbs</span>
    </div>

    <div class="preview" aria-live="polite" aria-label="Live verb preview">
      <span class="preview__icon" aria-hidden="true">{spinnerChar}</span>
      <span class="preview__verb">{currentVerb}</span>
      <span class="preview__cursor" aria-hidden="true"></span>
    </div>

    <div class="install-block">
      <div class="install-block__label">Install</div>
      <button class="install-block__cmd" onclick={copyInstallCmd} title="Copy install command">
        <span class="install-block__prompt">$</span> {installCmd}
        <span class="install-block__copy">
          {#if copied}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          {/if}
        </span>
      </button>
    </div>

    <div class="verbs">
      <div class="verbs__label">{hasMore ? `Preview (${normalizedVerbs.length} of ${set.verbCount})` : 'All verbs'}</div>
      <div class="verbs__list">
        {#each normalizedVerbs as verb}
          <div class="verbs__item">{verb}</div>
        {/each}
      </div>
      {#if hasMore}
        <p class="verbs__more">Install to get all {set.verbCount} verbs</p>
      {/if}
    </div>
  </div>
</main>

<style>
  .container { max-width: var(--max-w); margin: 0 auto; padding: 0 1.5rem; }

  .detail { padding: 3rem 0 4rem; }

  .back {
    display: inline-block;
    color: var(--text-faint);
    text-decoration: none;
    font-size: 0.78rem;
    margin-bottom: 2rem;
    transition: color 0.2s;
  }
  .back:hover { color: var(--accent); }

  .detail__name {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 0.5rem;
  }
  .detail__name::before { content: '> '; color: var(--text-faint); }

  .detail__desc {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
    max-width: 560px;
  }

  .detail__meta {
    display: flex;
    gap: 1rem;
    font-size: 0.78rem;
    color: var(--text-faint);
    margin-bottom: 2rem;
  }

  .detail__author {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    position: relative;
  }
  .detail__author:hover :global(.author-popup) { display: block; }

  .detail__avatar { width: 20px; height: 20px; border-radius: 0; }

  .detail__author-link {
    color: var(--text-faint);
    text-decoration: none;
    transition: color 0.2s;
  }
  .detail__author-link:hover { color: var(--accent); }

  /* ---- Preview ---- */

  .preview {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: color-mix(in srgb, var(--bg) 60%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    padding: 0.5rem 1rem;
    margin-bottom: 2rem;
    font-size: 0.85rem;
  }

  .preview__icon {
    color: var(--accent);
    font-weight: 700;
    width: 1ch;
    display: inline-block;
    text-align: center;
  }

  .preview__verb { color: var(--text); white-space: nowrap; }

  .preview__cursor {
    display: inline-block;
    width: 0.5ch;
    height: 1em;
    background: var(--accent);
    vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* ---- Install ---- */

  .install-block { margin-bottom: 2.5rem; }

  .install-block__label {
    font-size: 0.72rem;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
  }

  .install-block__cmd {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 560px;
    background: color-mix(in srgb, var(--bg-surface) 70%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    padding: 0.75rem 1rem;
    font: 0.82rem var(--mono);
    color: var(--text);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .install-block__cmd:hover { border-color: var(--accent); }

  .install-block__prompt { color: var(--accent); font-weight: 700; }

  .install-block__copy {
    margin-left: auto;
    color: var(--text-faint);
    display: flex;
    transition: color 0.2s;
  }

  .install-block__cmd:hover .install-block__copy { color: var(--accent); }

  /* ---- Verbs ---- */

  .verbs__label {
    font-size: 0.72rem;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.75rem;
  }

  .verbs__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.25rem 1.5rem;
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.8;
  }

  .verbs__item::before { content: '- '; color: var(--text-faint); }

  .verbs__more {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--text-faint);
    font-style: italic;
  }

  @media (max-width: 600px) {
    .verbs__list { grid-template-columns: 1fr; }
  }
</style>
