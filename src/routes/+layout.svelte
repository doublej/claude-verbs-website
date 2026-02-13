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
    --bg: #0d1117;
    --bg-raised: #161b22;
    --bg-surface: #1c2128;
    --border: #30363d;
    --border-accent: #4ade80;
    --text: #e6edf3;
    --text-muted: #8b949e;
    --text-faint: #6e7681;
    --accent: #4ade80;
    --accent-dim: rgba(74, 222, 128, 0.15);
    --cyan: #fbbf24;
    --bg-home: #0d1117;
    --border-subtle: rgba(255, 255, 255, 0.08);
    --disclaimer-bg: #000;
    --disclaimer-text: #888;
  }

  :global(html[data-theme='light']) {
    --bg: #ffffff;
    --bg-raised: #f6f8fa;
    --bg-surface: #ffffff;
    --border: #d0d7de;
    --border-accent: #22c55e;
    --text: #24292f;
    --text-muted: #57606a;
    --text-faint: #6e7781;
    --accent: #0969da;
    --accent-dim: rgba(9, 105, 218, 0.15);
    --cyan: #0550ae;
    --bg-home: #ffffff;
    --border-subtle: rgba(0, 0, 0, 0.08);
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
