<script lang="ts">
import ThemeToggle from '$lib/components/ThemeToggle.svelte'
</script>

<ThemeToggle />

<slot />

<footer class="disclaimer-bar">
  This project is not affiliated with, endorsed by, or sponsored by Anthropic or Claude.
</footer>

<style>
  :global(:root) {
    --mono: 'Space Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    --max-w: 960px;
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
    --accent: #16a34a;
    --accent-dim: rgba(22, 163, 74, 0.15);
    --cyan: #ca8a04;
    --bg-home: #f5f5f5;
    --disclaimer-bg: #e5e7eb;
    --disclaimer-text: #6b7280;
  }

  .disclaimer-bar {
    width: 100%;
    background: var(--disclaimer-bg);
    color: var(--disclaimer-text);
    text-align: center;
    font-size: 0.75rem;
    padding: 12px 12px;
    font-family: system-ui, sans-serif;
    transition: background-color 0.2s, color 0.2s;
  }
</style>
