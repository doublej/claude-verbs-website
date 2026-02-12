<script lang="ts">
import type { Authors } from '$lib/data/types'

const { usernames, authors }: { usernames: string[]; authors: Authors } = $props()
</script>

<div class="contributors">
  <h3 class="contributors__title">Contributors</h3>
  <p class="contributors__sub">
    Want to be listed here?
    <a href="https://github.com/doublej/claude-verbs/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">
      Add your username to contributors.json
    </a>
  </p>
  <div class="contributors__list">
    {#each usernames as username}
      {@const author = authors[username]}
      <a
        class="contributors__item"
        href="https://github.com/{username}"
        target="_blank"
        rel="noopener"
        title={author?.name ?? username}
      >
        {#if author?.avatarUrl}
          <img
            class="contributors__avatar"
            src="{author.avatarUrl}&s=64"
            alt={username}
            loading="lazy"
          />
        {:else}
          <span class="contributors__placeholder">{username[0]}</span>
        {/if}
        <span class="contributors__name">{username}</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .contributors {
    text-align: center;
  }

  .contributors__title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .contributors__title::before {
    content: '## ';
    color: var(--text-faint);
  }

  .contributors__sub {
    font-size: 0.75rem;
    color: var(--text-faint);
    margin-bottom: 1.5rem;
  }

  .contributors__sub a {
    color: var(--accent);
    text-decoration: none;
  }

  .contributors__sub a:hover {
    text-decoration: underline;
  }

  .contributors__list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .contributors__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    text-decoration: none;
    transition: transform 0.2s;
  }

  .contributors__item:hover {
    transform: translateY(-2px);
  }

  .contributors__avatar {
    width: 40px;
    height: 40px;
    border-radius: 0;
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    transition: border-color 0.2s;
  }

  .contributors__item:hover .contributors__avatar {
    border-color: var(--accent);
  }

  .contributors__placeholder {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--bg-raised) 70%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
  }

  .contributors__name {
    font-size: 0.68rem;
    color: var(--text-faint);
    transition: color 0.2s;
  }

  .contributors__item:hover .contributors__name {
    color: var(--accent);
  }
</style>
