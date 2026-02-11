<script lang="ts">
import type { Author } from '$lib/data/types'

const { author }: { author: Author } = $props()
</script>

<div class="author-popup">
  <div class="author-popup__header">
    {#if author.avatarUrl}
      <img
        class="author-popup__avatar"
        src="{author.avatarUrl}&s=96"
        alt=""
        loading="lazy"
      />
    {/if}
    <div>
      {#if author.name}
        <div class="author-popup__name">{author.name}</div>
      {/if}
      <a
        class="author-popup__handle"
        href="https://github.com/{author.username}"
        target="_blank"
        rel="noopener"
      >@{author.username}</a>
    </div>
  </div>
  {#if author.bio}
    <div class="author-popup__bio">{author.bio}</div>
  {/if}
  {#if author.repos.length > 0}
    <div class="author-popup__repos-label">Top repos</div>
    {#each author.repos as repo}
      <div class="author-popup__repo">
        <a
          class="author-popup__repo-name"
          href={repo.url}
          target="_blank"
          rel="noopener"
        >{repo.name}</a>
        <span class="author-popup__repo-stars">{'\u2605'} {repo.stars}</span>
      </div>
    {/each}
  {/if}
</div>

<style>
  .author-popup {
    display: none;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    z-index: 100;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1rem;
    width: 280px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
  }

  .author-popup__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .author-popup__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .author-popup__name {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text);
  }

  .author-popup__handle {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-decoration: none;
  }

  .author-popup__handle:hover {
    color: var(--accent);
  }

  .author-popup__bio {
    font-size: 0.72rem;
    color: var(--text-muted);
    line-height: 1.5;
    margin-bottom: 0.75rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .author-popup__repos-label {
    font-size: 0.65rem;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.35rem;
  }

  .author-popup__repo {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 0.72rem;
    line-height: 1.8;
  }

  .author-popup__repo-name {
    color: var(--cyan);
    text-decoration: none;
    font-weight: 700;
  }

  .author-popup__repo-name:hover {
    text-decoration: underline;
  }

  .author-popup__repo-stars {
    color: var(--text-faint);
    font-size: 0.65rem;
    white-space: nowrap;
  }
</style>
