<script lang="ts">
import type { Author, VerbSet } from '$lib/data/types'
import AuthorPopup from './AuthorPopup.svelte'

const { set, author }: { set: VerbSet; author: Author | undefined } = $props()

const normalizedVerbs = $derived(set.verbs.map((v) => v.replace(/^\s*I(?:[\u2019']m| am)\s+/i, '')))

let expanded = $state(false)

function toggle() {
  expanded = !expanded
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  toggle()
}
</script>

<div
  class="card"
  class:expanded
  tabindex="0"
  role="button"
  aria-expanded={expanded}
  onclick={toggle}
  onkeydown={onKeydown}
>
  <span class="card__expand-hint" aria-hidden="true">&#9654;</span>
  <div class="card__name">{set.name}</div>
  <div class="card__desc">{set.description}</div>
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
    <span>{normalizedVerbs.length} verbs</span>
  </div>
  {#if expanded}
    <div class="card__verbs-panel">
      <div class="card__verbs-panel-label">Verbs</div>
      <div class="card__verbs-list">
        {#each normalizedVerbs as verb}
          <div class="card__verb-item">{verb}</div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .card {
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1.25rem;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    position: relative;
  }

  .card:hover,
  .card:focus-visible {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent), 0 0 20px var(--accent-dim);
    outline: none;
  }

  .card__name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 0.35rem;
  }

  .card__desc {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
    line-height: 1.5;
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

  .card__author:hover :global(.author-popup) {
    display: block;
  }

  .card__author-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    vertical-align: middle;
  }

  .card__author-link {
    color: var(--text-faint);
    text-decoration: none;
    transition: color 0.2s;
  }

  .card__author-link:hover {
    color: var(--accent);
  }

  .card__expand-hint {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    font-size: 0.72rem;
    color: var(--text-faint);
    transition: color 0.2s, transform 0.2s;
  }

  .card:hover .card__expand-hint {
    color: var(--accent);
  }

  .expanded .card__expand-hint {
    transform: rotate(90deg);
  }

  .card__verbs-panel {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .card__verbs-panel-label {
    font-size: 0.72rem;
    color: var(--text-faint);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .card__verbs-list {
    max-height: 200px;
    overflow-y: auto;
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.8;
    padding-right: 0.5rem;
  }

  .card__verbs-list::-webkit-scrollbar {
    width: 4px;
  }

  .card__verbs-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .card__verbs-list::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
  }

  .card__verb-item::before {
    content: '- ';
    color: var(--text-faint);
  }
</style>
