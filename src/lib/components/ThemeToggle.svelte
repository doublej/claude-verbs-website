<script lang="ts">
import { clearDetected, getTheme, getWasDetected, setTheme } from '$lib/theme.svelte'
import { onMount } from 'svelte'

const theme = $derived(getTheme())
const detected = $derived(getWasDetected())

let showDetected = $state(false)

onMount(() => {
  if (!detected) return
  // small delay so the slide-in animation is visible
  requestAnimationFrame(() => {
    showDetected = true
    setTimeout(() => {
      showDetected = false
      clearDetected()
    }, 2000)
  })
})

function cycleTheme() {
  setTheme(theme === 'light' ? 'dark' : 'light')
}

function getLabel(): string {
  return theme === 'light' ? 'Light mode' : 'Dark mode'
}
</script>

<div class="theme-toggle-wrapper">
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
		{:else}
			<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
			</svg>
		{/if}
	</button>

	<div class="detected-badge" class:visible={showDetected}>
		DETECTED
	</div>
</div>

<style>
	.theme-toggle-wrapper {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 100;
	}

	.theme-toggle {
		position: relative;
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
		z-index: 2;
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

	.detected-badge {
		position: absolute;
		top: 0;
		right: 44px;
		height: 44px;
		background: var(--accent);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font: 700 0.72rem var(--mono);
		letter-spacing: 0.5px;
		padding: 0 1rem;
		white-space: nowrap;
		z-index: 1;
		transform: translateX(100%);
		opacity: 0;
		transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
		pointer-events: none;
	}

	.detected-badge.visible {
		transform: translateX(0);
		opacity: 1;
	}
</style>
