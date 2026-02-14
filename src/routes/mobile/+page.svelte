<script lang="ts">
import Gallery from '$lib/components/Gallery.svelte'
import type { PageData } from './$types'

const { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>Claude Verbs</title>
	<meta
		name="description"
		content="Replace boring spinner text with themed verb sets."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main>
	<section class="gallery" aria-label="Verb set gallery">
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
					<span class="terminal__dot"></span>
					<span class="terminal__dot"></span>
					<span class="terminal__dot"></span>
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

	:global(html) { scroll-behavior: smooth; }
	:global(body) {
		font-family: var(--mono);
		background: var(--bg);
		color: var(--text);
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
	}

	.page-frame {
		max-width: var(--max-w);
		margin: 0 auto;
		padding: 0 1rem;
	}

	main {
		padding-top: 1.5rem;
	}

	section { padding: 2rem 0; }
	.section-heading {
		font-family: var(--display);
		font-size: clamp(1.5rem, 5vw, 2.5rem);
		font-weight: 700;
		color: var(--text);
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.terminal {
		background: color-mix(in srgb, var(--bg-surface) 70%, transparent);
		border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
		overflow: hidden;
		max-width: 560px;
		margin: 0 auto;
	}

	.terminal__bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0.65rem 1rem;
		background: color-mix(in srgb, var(--bg-raised) 60%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
	}

	.terminal__dot { width: 10px; height: 10px; background: var(--text-faint); }
	.terminal__body { padding: 1.25rem; font-size: 0.82rem; line-height: 2; }
	.terminal__line::before { content: '$ '; color: var(--accent); }
	.terminal__comment { color: var(--text-faint); }
	.terminal__comment::before { content: '# '; }

	.contribute { padding-top: 1rem; }
	.contribute__sub { text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem; }

	.steps {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		max-width: 680px;
		margin: 0 auto 1.5rem;
	}

	.step { padding: 1rem; text-align: center; }

	.step__num {
		font-family: var(--display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 0.25rem;
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
		transition: background 0.2s, border-color 0.2s;
	}

	.contribute__link a:hover {
		background: color-mix(in srgb, var(--accent) 20%, transparent);
		border-color: var(--accent);
	}

	footer { padding: 2rem 0 4rem; text-align: center; font-size: 0.75rem; color: var(--text-faint); }
	footer a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
	footer a:hover { color: var(--accent); }
	footer .footer__sep { margin: 0 0.5rem; }
</style>
