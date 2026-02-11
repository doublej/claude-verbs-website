<script lang="ts">
import { getTheme, setTheme } from '$lib/theme.svelte'

const theme = $derived(getTheme())

function cycleTheme() {
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  setTheme(next)
}

function getLabel(): string {
  if (theme === 'light') return 'Light mode'
  if (theme === 'dark') return 'Dark mode'
  return 'System theme'
}

function getIcon(): string {
  if (theme === 'light') return '☀️'
  if (theme === 'dark') return '🌙'
  return '💻'
}
</script>

<button
	class="theme-toggle"
	onclick={cycleTheme}
	aria-label={getLabel()}
	title={getLabel()}
>
	<span class="icon">{getIcon()}</span>
</button>

<style>
	.theme-toggle {
		position: fixed;
		top: 1rem;
		right: 1rem;
		width: 44px;
		height: 44px;
		border-radius: 8px;
		background: var(--bg-raised);
		border: 1px solid var(--border);
		color: var(--text);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: all 0.2s;
		font-size: 20px;
		padding: 0;
	}

	.theme-toggle:hover {
		background: var(--bg-surface);
		border-color: var(--border-accent);
		transform: scale(1.05);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.icon {
		display: block;
		line-height: 1;
	}
</style>
