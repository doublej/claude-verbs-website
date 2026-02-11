<script lang="ts">
import Gallery from '$lib/components/Gallery.svelte'
import SpinnerDemo from '$lib/components/SpinnerDemo.svelte'
import { loadSets } from '$lib/data/sets'
import { createApp } from '$lib/pixi/app'
import { getResolvedTheme } from '$lib/theme.svelte'
import { onMount } from 'svelte'
import type { PageData } from './$types'

const { data }: { data: PageData } = $props()

const allVerbs = $derived(
  Object.values(data.sets)
    .flat()
    .flatMap((s) => s.verbs),
)

let wrap: HTMLDivElement
let revealed = $state(false)
let scrollLocked = $state(true)

function unlock() {
  if (revealed) return
  revealed = true
  scrollLocked = false
  window.scrollTo({ top: 120, behavior: 'smooth' })
}

$effect(() => {
  document.body.classList.toggle('scroll-locked', scrollLocked)
  return () => document.body.classList.remove('scroll-locked')
})

onMount(() => {
  const sets = loadSets()
  let cleanup: (() => void) | undefined

  function init() {
    createApp(wrap, sets, { onMarketplace: unlock }).then((fn) => {
      cleanup = fn
    })
  }

  init()

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-theme') {
        cleanup?.()
        init()
        break
      }
    }
  })

  observer.observe(document.documentElement, { attributes: true })

  return () => {
    cleanup?.()
    observer.disconnect()
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
		href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div bind:this={wrap} id="canvas-wrap" class:revealed>
	{#if !revealed}
		<button class="skip-btn" onclick={unlock}>SKIP TO MARKETPLACE</button>
	{/if}
</div>

<main>
	<section class="demo" aria-label="Spinner demo">
		<div class="container">
			<SpinnerDemo verbs={allVerbs} />
		</div>
	</section>

	<section class="gallery" aria-label="Verb set gallery">
		<div class="container">
			<h2 class="section-heading">Browse Sets</h2>
			<Gallery sets={data.sets} authors={data.authors} />
		</div>
	</section>

	<section class="install" aria-label="Installation instructions">
		<div class="container">
			<h2 class="section-heading">Install</h2>
			<div class="terminal" role="img" aria-label="Terminal showing install commands">
				<div class="terminal__bar" aria-hidden="true">
					<span class="terminal__dot terminal__dot--red"></span>
					<span class="terminal__dot terminal__dot--yellow"></span>
					<span class="terminal__dot terminal__dot--green"></span>
				</div>
				<div class="terminal__body">
					<div class="terminal__comment">install globally</div>
					<div class="terminal__line">bun install -g spinner-verbs</div>
					<br />
					<div class="terminal__comment">see available sets</div>
					<div class="terminal__line">spinner-verbs list</div>
					<br />
					<div class="terminal__comment">apply a set</div>
					<div class="terminal__line">spinner-verbs install &lt;name&gt;</div>
				</div>
			</div>
		</div>
	</section>

	<section class="contribute" aria-label="Contribute your own set">
		<div class="container">
			<h2 class="section-heading">Create Your Own</h2>
			<p class="contribute__sub">Got a theme in mind? Adding a set takes just three steps.</p>
			<div class="steps">
				<div class="step">
					<div class="step__num">1</div>
					<div class="step__label">Fork</div>
					<p class="step__desc">Fork the repo and clone it locally</p>
				</div>
				<div class="step">
					<div class="step__num">2</div>
					<div class="step__label">Create</div>
					<p class="step__desc">Add a JSON file in sets/&lt;lang&gt;/ with your verbs</p>
				</div>
				<div class="step">
					<div class="step__num">3</div>
					<div class="step__label">PR</div>
					<p class="step__desc">Open a pull request and share it with the community</p>
				</div>
			</div>
			<div class="contribute__link">
				<a href="https://github.com/jurrejan/spinner-verbs/blob/main/CONTRIBUTING.md">
					Read the Contributing Guide
				</a>
			</div>
		</div>
	</section>
</main>

<footer>
	<div class="container">
		<span>Made with <span aria-label="cursor">_</span> by JJ</span>
		<span class="footer__sep">|</span>
		<a href="https://github.com/jurrejan/spinner-verbs">GitHub</a>
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

	:global(html) { scroll-behavior: smooth; }
	:global(body) {
		font-family: var(--mono);
		background: var(--bg);
		color: var(--text);
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
		transition: background-color 0.2s, color 0.2s;
	}
	:global(body.scroll-locked) { overflow: hidden; }

	.container { max-width: var(--max-w); margin: 0 auto; padding: 0 1.5rem; }

	/* ---- Canvas ---- */

	#canvas-wrap {
		position: relative;
		width: 100%;
		height: 100vh;
		height: 100svh;
		overflow: hidden;
		background: var(--bg-home);
	}

	#canvas-wrap.revealed::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 120px;
		background: linear-gradient(transparent, var(--bg));
		pointer-events: none;
		z-index: 5;
	}

	.skip-btn {
		position: absolute;
		bottom: 2rem;
		right: 2rem;
		z-index: 10;
		font: 700 0.72rem var(--mono);
		color: var(--text-faint);
		background: none;
		border: 1px solid var(--text-faint);
		padding: 0.5rem 1rem;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
	}

	.skip-btn:hover { opacity: 1; }

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

	/* ---- Sections ---- */

	section { padding: 4rem 0; }
	.demo { text-align: center; padding: 3rem 0; border-bottom: 1px solid var(--border); }

	.section-heading {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text);
		margin-bottom: 2rem;
		text-align: center;
	}
	.section-heading::before { content: '# '; color: var(--text-faint); }

	/* ---- Terminal ---- */

	.terminal {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
		max-width: 560px;
		margin: 0 auto;
	}

	.terminal__bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0.65rem 1rem;
		background: var(--bg-raised);
		border-bottom: 1px solid var(--border);
	}

	.terminal__dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--border);
	}

	.terminal__dot--red { background: #f85149; }
	.terminal__dot--yellow { background: #d29922; }
	.terminal__dot--green { background: #3fb950; }
	.terminal__body { padding: 1.25rem; font-size: 0.82rem; line-height: 2; }
	.terminal__line::before { content: '$ '; color: var(--accent); }
	.terminal__comment { color: var(--text-faint); }
	.terminal__comment::before { content: '# '; }

	/* ---- Contribute ---- */

	.contribute { border-top: 1px solid var(--border); }
	.contribute__sub { text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 2rem; }

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		max-width: 680px;
		margin: 0 auto 2rem;
	}

	.step {
		background: var(--bg-raised);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 1.25rem;
		text-align: center;
	}

	.step__num {
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
		color: var(--bg);
		background: var(--accent);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.7rem 1.8rem;
		border-radius: 6px;
		transition: opacity 0.2s;
	}

	.contribute__link a:hover { opacity: 0.85; }

	footer {
		border-top: 1px solid var(--border);
		padding: 2rem 0 4rem;
		text-align: center;
		font-size: 0.75rem;
		color: var(--text-faint);
	}

	footer a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
	footer a:hover { color: var(--accent); }
	footer .footer__sep { margin: 0 0.5rem; }

	@media (max-width: 600px) {
		section { padding: 2.5rem 0; }
		.steps { grid-template-columns: 1fr; }
	}
</style>
