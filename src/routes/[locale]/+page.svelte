<script lang="ts">
import Gallery from '$lib/components/Gallery.svelte'
import { loadSets } from '$lib/data/sets'
import { type AppHandle, createApp } from '$lib/pixi/app'
import { onMount } from 'svelte'
import type { PageData } from './$types'

const { data }: { data: PageData } = $props()

let wrap: HTMLDivElement
let revealed = $state(false)
let scrollLocked = $state(true)
let escHintActive = $state(false)
let escProgress = $state(0)
let restartHintActive = $state(false)
let restartProgress = $state(0)
let restartHoldStart = 0
let restartRaf = 0
let appHandle: AppHandle | undefined

const RESTART_HOLD_MS = 1500

function unlock() {
  if (revealed) return
  revealed = true
  scrollLocked = false
  appHandle?.disableScrollZoom()
  appHandle?.setOverlapped(true)
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

function lock() {
  if (!revealed) return
  revealed = false
  scrollLocked = true
  escHintActive = false
  escProgress = 0
  cancelRestart()
  appHandle?.setOverlapped(false)
  appHandle?.restartExperience()
}

function showRestartHint() {
  if (restartHintActive) return
  restartHintActive = true
  restartProgress = 0
}

function cancelRestart() {
  restartHintActive = false
  restartProgress = 0
  restartHoldStart = 0
  if (restartRaf) {
    cancelAnimationFrame(restartRaf)
    restartRaf = 0
  }
}

function tickRestart() {
  if (!restartHoldStart) {
    restartRaf = 0
    return
  }
  restartProgress = Math.min((Date.now() - restartHoldStart) / RESTART_HOLD_MS, 1)
  if (restartProgress >= 1) {
    cancelRestart()
    lock()
    return
  }
  restartRaf = requestAnimationFrame(tickRestart)
}

function onRestartKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Enter' || !restartHintActive) return
  e.preventDefault()
  if (restartHoldStart) return
  restartHoldStart = Date.now()
  restartRaf = requestAnimationFrame(tickRestart)
}

function onRestartKeyUp(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  restartHoldStart = 0
  restartProgress = 0
  if (restartRaf) {
    cancelAnimationFrame(restartRaf)
    restartRaf = 0
  }
}

$effect(() => {
  document.body.classList.toggle('scroll-locked', scrollLocked)
  return () => document.body.classList.remove('scroll-locked')
})

onMount(() => {
  const skipIntro = window.location.hash === '#browse'
  if (!skipIntro) window.scrollTo(0, 0)
  if (skipIntro) {
    scrollLocked = false
    revealed = true
  }
  const sets = loadSets()
  let initVersion = 0
  let tornDown = false

  function init() {
    const version = ++initVersion
    createApp(wrap, sets, {
      onMarketplace: unlock,
      onEscSkipActivated: () => {
        escHintActive = true
      },
      onEscSkipProgress: (p: number) => {
        escProgress = p
        if (p === 0) escHintActive = false
      },
      preferredLang: data.preferredLang,
    }).then((handle) => {
      if (tornDown || version !== initVersion) {
        handle.cleanup()
        return
      }
      appHandle = handle
      if (skipIntro) {
        handle.disableScrollZoom()
        handle.setOverlapped(true)
      }
    })
  }

  init()

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-theme') {
        const nextTheme = document.documentElement.getAttribute('data-theme')
        if (mutation.oldValue === nextTheme) continue
        appHandle?.cleanup()
        appHandle = undefined
        init()
        break
      }
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
    attributeOldValue: true,
  })

  function onScroll() {
    if (!revealed) return
    if (window.scrollY <= 0) showRestartHint()
    else cancelRestart()
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('keydown', onRestartKeyDown)
  document.addEventListener('keyup', onRestartKeyUp)

  return () => {
    tornDown = true
    initVersion++
    appHandle?.cleanup()
    observer.disconnect()
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('keydown', onRestartKeyDown)
    document.removeEventListener('keyup', onRestartKeyUp)
    cancelRestart()
  }
})
</script>

<svelte:head>
	<title>Claude Verbs</title>
	<meta
		name="description"
		content="Replace boring spinner text with themed verb sets. Install in seconds."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div bind:this={wrap} id="canvas-wrap" class:revealed>
	{#if !revealed}
		<button class="skip-btn" class:esc-active={escHintActive} onclick={() => appHandle ? appHandle.skipToMarketplace() : unlock()}>
			{#if escHintActive}
				<span class="skip-btn__sizer" aria-hidden="true">SKIP INTRO</span>
				<span class="skip-btn__label">HOLD ESC 3 SEC.</span>
				<span class="skip-btn__fill" style="transform: scaleX({escProgress})"></span>
			{:else}
				SKIP INTRO
			{/if}
		</button>
	{/if}
</div>

{#if restartHintActive}
	<div class="restart-hint">
		<span class="restart-hint__sizer" aria-hidden="true">HOLD ENTER TO RESTART</span>
		<span class="restart-hint__label">HOLD ENTER TO RESTART</span>
		<span class="restart-hint__fill" style="transform: scaleX({restartProgress})"></span>
	</div>
{/if}

<main>
	<section id="browse" class="gallery" aria-label="Verb set gallery">
		<div class="page-frame">
			<h2 class="section-heading">Browse Sets</h2>
			<Gallery sets={data.sets} authors={data.authors} preferredLang={data.preferredLang} />
		</div>
	</section>

	<section class="install" aria-label="Installation instructions">
		<div class="page-frame">
			<h2 class="section-heading">Install</h2>
			<div class="terminal" role="img" aria-label="Terminal showing install commands">
				<div class="terminal__bar" aria-hidden="true">
					<span class="terminal__dot terminal__dot--red"></span>
					<span class="terminal__dot terminal__dot--yellow"></span>
					<span class="terminal__dot terminal__dot--green"></span>
				</div>
				<div class="terminal__body">
					<div class="terminal__comment">see available sets</div>
					<div class="terminal__line">bunx github:doublej/claude-verbs-cli list</div>
					<br />
					<div class="terminal__comment">apply a set</div>
					<div class="terminal__line">bunx github:doublej/claude-verbs-cli install &lt;name&gt;</div>
				</div>
			</div>
		</div>
	</section>

	<section class="contribute" aria-label="Contribute your own set">
		<div class="page-frame">
			<h2 class="section-heading">Create Your Own</h2>
			<p class="contribute__sub">Got a theme in mind? Adding a set takes just three steps.</p>
			<div class="steps">
				<div class="step">
					<div class="step__num">1</div>
					<div class="step__label">Fork</div>
					<p class="step__desc">Fork doublej/claude-verbs and clone it locally</p>
				</div>
				<div class="step">
					<div class="step__num">2</div>
					<div class="step__label">Create</div>
					<p class="step__desc">Add your JSON file in the claude-verbs repo root</p>
				</div>
				<div class="step">
					<div class="step__num">3</div>
					<div class="step__label">PR</div>
					<p class="step__desc">Open a pull request in doublej/claude-verbs</p>
				</div>
			</div>
			<div class="contribute__link">
				<a
					href="https://github.com/doublej/claude-verbs/blob/main/CONTRIBUTING.md"
					target="_blank"
					rel="noopener"
				>
					Read the Contributing Guide
				</a>
			</div>
			<p class="contribute__note">
				Include an author manifest in your PR description: GitHub profile URL, top 3 projects,
				and a generic one-sentence description.
			</p>
		</div>
	</section>
</main>

<footer>
	<div class="page-frame">
		<span>Made with <span aria-label="cursor">_</span> by JJ</span>
		<span class="footer__sep">|</span>
		<a href="https://github.com/doublej/claude-verbs">GitHub</a>
	</div>
</footer>

<style>
	:global(*),
	:global(*::before),
	:global(*::after) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(html) { scroll-behavior: smooth; scrollbar-gutter: stable; }
	:global(body) {
		font-family: var(--mono);
		background: transparent;
		color: var(--text);
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
	}
	:global(body.scroll-locked) { overflow: hidden; }

	.page-frame {
		max-width: var(--max-w);
		margin: 0 auto;
		padding: 0 1.5rem;
		border-left: 0.5px solid var(--border-subtle);
		border-right: 0.5px solid var(--border-subtle);
	}

	/* ---- Canvas ---- */

	#canvas-wrap {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		background: var(--bg-home);
	}

	#canvas-wrap.revealed::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(transparent 20%, color-mix(in srgb, var(--bg) 85%, transparent));
		pointer-events: none;
		z-index: 5;
	}

	.skip-btn {
		position: absolute;
		bottom: 0;
		right: 0;
		z-index: 10;
		font: 700 0.72rem var(--mono);
		color: var(--bg);
		background: var(--accent);
		border: none;
		height: 40px;
		padding: 0 1.5rem;
		cursor: pointer;
		transition: filter 0.2s;
		overflow: hidden;
		white-space: nowrap;
	}

	.skip-btn:hover { filter: brightness(1.3); }

	.skip-btn__sizer { opacity: 0; }

	.skip-btn__label {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.skip-btn__fill {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--bg) 40%, transparent);
		transform-origin: left;
		pointer-events: none;
	}

	.skip-btn.esc-active {
		animation: skip-blink 0.15s ease-in-out 4;
	}

	@keyframes skip-blink {
		50% { opacity: 0.3; }
	}

	.restart-hint {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 10;
		font: 700 0.72rem var(--mono);
		color: var(--bg);
		background: var(--accent);
		height: 40px;
		padding: 0 1.5rem;
		overflow: hidden;
		white-space: nowrap;
		animation: restart-fade-in 0.3s ease-out;
	}

	.restart-hint__sizer { opacity: 0; display: flex; align-items: center; height: 100%; }

	.restart-hint__label {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.restart-hint__fill {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--bg) 40%, transparent);
		transform-origin: left;
		pointer-events: none;
	}

	@keyframes restart-fade-in {
		from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
		to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
	}

	#canvas-wrap :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	:global(.tp-dfwv) {
		z-index: 10;
		position: fixed !important;
		top: 8px;
		right: 8px;
	}

	main {
		position: relative;
		margin-top: 100vh;
		margin-top: 100svh;
	}

	/* ---- Sections ---- */

	section { padding: 4rem 0; }
	.section-heading {
		font-family: var(--display);
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 700;
		color: var(--text);
		margin-bottom: 2rem;
		text-align: center;
	}

	/* ---- Terminal ---- */

	.terminal {
		background: color-mix(in srgb, var(--bg-surface) 70%, transparent);
		border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
		border-radius: 0;
		overflow: hidden;
		max-width: 560px;
		margin: 0 auto;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.terminal__bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0.65rem 1rem;
		background: color-mix(in srgb, var(--bg-raised) 60%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
	}

	.terminal__dot { width: 10px; height: 10px; border-radius: 0; background: var(--border); }
	.terminal__dot--red, .terminal__dot--yellow, .terminal__dot--green { background: var(--text-faint); }
	.terminal__body { padding: 1.25rem; font-size: 0.82rem; line-height: 2; }
	.terminal__line::before { content: '$ '; color: var(--accent); }
	.terminal__comment { color: var(--text-faint); }
	.terminal__comment::before { content: '# '; }

	/* ---- Contribute ---- */

	.contribute { padding-top: 2rem; }
	.contribute__sub { text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 2rem; }

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		max-width: 680px;
		margin: 0 auto 2rem;
	}

	.step {
		padding: 1.25rem;
		text-align: center;
	}

	.step__num {
		font-family: var(--display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 0.35rem;
	}

	.step__label {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text);
		margin-bottom: 0.25rem;
	}

	.step__desc {
		font-size: 0.72rem;
		color: var(--text-muted);
		line-height: 1.5;
	}

	.contribute__link { display: block; text-align: center; }
	.contribute__link a {
		display: inline-block;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.7rem 1.8rem;
		border-radius: 0;
		transition: background 0.2s, border-color 0.2s;
	}

	.contribute__link a:hover {
		background: color-mix(in srgb, var(--accent) 20%, transparent);
		border-color: var(--accent);
	}

	.contribute__note { text-align: center; color: var(--text-faint); font-size: 0.72rem; max-width: 720px; margin: 1rem auto 0; line-height: 1.6; }

	footer { position: relative; padding: 2rem 0 4rem; text-align: center; font-size: 0.75rem; color: var(--text-faint); }

	footer a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
	footer a:hover { color: var(--accent); }
	footer .footer__sep { margin: 0 0.5rem; }

	@media (max-width: 600px) {
		section { padding: 2.5rem 0; }
		.steps { grid-template-columns: 1fr; }
		.page-frame {
			border-left: none;
			border-right: none;
		}
	}
</style>
