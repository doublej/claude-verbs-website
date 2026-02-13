<script lang="ts">
import type { Author, VerbSet } from '$lib/data/types'
import { onMount } from 'svelte'
import AuthorPopup from './AuthorPopup.svelte'

const SPINNER_CHARS = ['|', '/', '-', '\\']

const { set, author }: { set: VerbSet; author: Author | undefined } = $props()

const normalizedVerbs = $derived(set.verbs.map((v) => v.replace(/^\s*I(?:[\u2019']m| am)\s+/i, '')))

let copied = $state(false)
let linkCopied = $state(false)

const installCmd = $derived(`bunx github:doublej/claude-verbs-cli install ${set.name}`)

function copyInstallCmd(e: MouseEvent) {
  e.stopPropagation()
  navigator.clipboard.writeText(installCmd)
  copied = true
  setTimeout(() => {
    copied = false
  }, 1500)
}
let hovered = $state(false)
let currentVerb = $state('')
let spinnerChar = $state('|')
let verbTimer: ReturnType<typeof setInterval> | undefined
let charTimer: ReturnType<typeof setInterval> | undefined
let shuffled: string[] = []
let verbIdx = 0
let charIdx = 0

function copyDeeplink(e: MouseEvent) {
  e.stopPropagation()
  const url = `${window.location.origin}/${set.language}/${set.name}/`
  navigator.clipboard.writeText(url)
  linkCopied = true
  setTimeout(() => {
    linkCopied = false
  }, 1500)
}

function startTimers() {
  verbTimer = setInterval(() => {
    verbIdx = (verbIdx + 1) % shuffled.length
    currentVerb = shuffled[verbIdx]
  }, 2200)
  charTimer = setInterval(() => {
    charIdx = (charIdx + 1) % SPINNER_CHARS.length
    spinnerChar = SPINNER_CHARS[charIdx]
  }, 200)
}

function stopTimers() {
  clearInterval(verbTimer)
  clearInterval(charTimer)
  verbTimer = undefined
  charTimer = undefined
}

function onMouseEnter() {
  hovered = true
  startTimers()
}

function onMouseLeave() {
  hovered = false
  stopTimers()
}

onMount(() => {
  shuffled = [...normalizedVerbs]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  currentVerb = shuffled[0] ?? 'Thinking...'

  return () => stopTimers()
})
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="card"
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  <button
    class="card__deeplink"
    class:card__deeplink--copied={linkCopied}
    title="Copy link to this set"
    aria-label="Copy link to {set.name}"
    onclick={copyDeeplink}
  >
    {#if linkCopied}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
    {:else}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
    {/if}
  </button>
  <button
    class="card__copy"
    class:card__copy--copied={copied}
    title="Copy install command"
    aria-label="Copy install command: {installCmd}"
    onclick={copyInstallCmd}
  >
    {#if copied}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
    {:else}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
    {/if}
  </button>
  <div class="card__name">{set.displayName}</div>
  <div class="card__desc">{set.description}</div>
  <div class="card__preview" class:card__preview--active={hovered} aria-live="polite" aria-label="Verb preview">
    <span class="card__preview-icon" aria-hidden="true">{spinnerChar}</span>
    <span class="card__preview-verb">{currentVerb}</span>
    {#if hovered}
      <span class="card__preview-cursor" aria-hidden="true"></span>
    {/if}
  </div>
  <div class="card__meta">
    <span class="card__author">
      {#if author?.avatarUrl}
        <img
          class="card__author-avatar"
          src="{author.avatarUrl}&s=40"
          alt=""
          loading="lazy"
        />
      {/if}
      <a
        class="card__author-link"
        href="https://github.com/{set.github}"
        target="_blank"
        rel="noopener"
      >{set.author}</a>
      {#if author}
        <AuthorPopup {author} />
      {/if}
    </span>
    <span class="card__verb-count">{set.verbCount} verbs</span>
  </div>
</div>

<style>
  .card {
    padding: 1.25rem;
    transition: background 0.2s;
    position: relative;
  }

  .card:hover {
    background: var(--bg-raised);
  }

  .card:hover .card__name,
  .card:hover .card__verb-count {
    opacity: 1;
  }

  .card__name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 0.35rem;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .card__desc {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-bottom: 0.65rem;
    line-height: 1.5;
    height: calc(2 * 1.5 * 0.78rem);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card__preview {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: color-mix(in srgb, var(--bg) 60%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 30%, transparent);
    padding: 0.35rem 0.75rem;
    margin-bottom: 0.65rem;
    font-size: 0.72rem;
    min-height: 1.8rem;
    opacity: 0.4;
    transition: opacity 0.2s, border-color 0.2s;
  }

  .card__preview--active {
    opacity: 1;
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .card__preview-icon {
    color: var(--text-faint);
    font-weight: 700;
    width: 1ch;
    display: inline-block;
    text-align: center;
  }

  .card__preview--active .card__preview-icon {
    color: var(--accent);
  }

  .card__preview-verb {
    color: var(--text-faint);
    white-space: nowrap;
    overflow: hidden;
  }

  .card__preview--active .card__preview-verb {
    color: var(--text);
  }

  .card__preview-cursor {
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

  .card__verb-count {
    opacity: 0;
    transition: opacity 0.2s;
  }

  .card__meta {
    display: flex;
    gap: 1rem;
    font-size: 0.72rem;
    color: var(--text-faint);
  }

  .card__author {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    position: relative;
    cursor: pointer;
  }

  .card__author:hover :global(.author-popup) { display: block; }

  .card__author-avatar { width: 20px; height: 20px; border-radius: 0; vertical-align: middle; }

  .card__author-link { color: var(--text-faint); text-decoration: none; transition: color 0.2s; }
  .card__author-link:hover { color: var(--accent); }

  .card__copy,
  .card__deeplink {
    position: absolute;
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--text-faint);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.2rem;
    transition: color 0.2s, border-color 0.2s;
  }

  .card__deeplink { top: 1.25rem; right: 3rem; }
  .card__copy { top: 1.25rem; right: 1.25rem; }

  .card__copy:hover,
  .card__deeplink:hover {
    color: var(--accent);
    border-color: var(--border);
  }

  .card__copy--copied,
  .card__deeplink--copied {
    color: var(--accent);
  }
</style>
