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
</script>

<button
	class="theme-toggle"
	onclick={cycleTheme}
	aria-label={getLabel()}
	title={getLabel()}
>
	{#if theme === 'light'}
		<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="5"/>
			<line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
			<line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
		</svg>
	{:else if theme === 'dark'}
		<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
		</svg>
	{:else}
		<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		position: fixed;
		top: 0;
		right: 0;
		width: 44px;
		height: 44px;
		border-radius: 0;
		background: var(--bg-raised);
		border: none;
		color: var(--text);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: all 0.2s;
		padding: 0;
	}

	.theme-toggle:hover {
		background: var(--bg-surface);
		transform: scale(1.05);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.icon {
		width: 20px;
		height: 20px;
	}
</style>
