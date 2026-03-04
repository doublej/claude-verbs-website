<script lang="ts">
import { page } from '$app/stores'
import ThemeToggle from '$lib/components/ThemeToggle.svelte'

$effect(() => {
  const locale = $page.data.locale as string | undefined
  if (locale) {
    document.documentElement.lang = locale.replace('_', '-')
  }
})
</script>

<ThemeToggle />

<slot />

<footer class="disclaimer-bar">
  This project is not affiliated with, endorsed by, or sponsored by Anthropic or Claude.
</footer>

<style>
  :global(:root) {
    --mono: 'Space Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    --display: 'Space Grotesk', system-ui, sans-serif;
    --max-w: 960px;
    --theme-transition-duration: 0.2s;
  }

  :global(html[data-theme='dark']) {
    --bg: #000;
    --bg-raised: #111;
    --bg-surface: #000;
    --border: #333;
    --border-accent: #fff;
    --text: #fff;
    --text-muted: #999;
    --text-faint: #666;
    --accent: #fff;
    --bg-home: #000;
    --border-subtle: #222;
    --disclaimer-bg: #000;
    --disclaimer-text: #888;
  }

  :global(html[data-theme='light']) {
    --bg: #fff;
    --bg-raised: #f0f0f0;
    --bg-surface: #fff;
    --border: #ccc;
    --border-accent: #000;
    --text: #000;
    --text-muted: #666;
    --text-faint: #999;
    --accent: #000;
    --bg-home: #fff;
    --border-subtle: #ddd;
    --disclaimer-bg: #e5e7eb;
    --disclaimer-text: #6b7280;
  }

  :global(html[data-theme-ready='true'] body),
  :global(html[data-theme-ready='true'] #canvas-wrap),
  :global(html[data-theme-ready='true'] main),
  :global(html[data-theme-ready='true'] section),
  :global(html[data-theme-ready='true'] footer),
  :global(html[data-theme-ready='true'] .terminal),
  :global(html[data-theme-ready='true'] .theme-toggle),
  :global(html[data-theme-ready='true'] .disclaimer-bar) {
    transition:
      background-color var(--theme-transition-duration) ease,
      color var(--theme-transition-duration) ease,
      border-color var(--theme-transition-duration) ease;
  }

  .disclaimer-bar {
    width: 100%;
    background: var(--disclaimer-bg);
    color: var(--disclaimer-text);
    text-align: center;
    font-size: 0.75rem;
    padding: 12px 12px;
    font-family: system-ui, sans-serif;
  }
</style>
