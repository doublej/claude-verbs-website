<script lang="ts">
import Contributors from '$lib/components/Contributors.svelte'
import Gallery from '$lib/components/Gallery.svelte'
import type { PageData } from './$types'

const { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Claude Verbs -- Themed spinner verb sets for Claude Code</title>
  <meta
    name="description"
    content="Browse, preview, and install themed Claude Verbs sets for Claude Code. Customize your CLI experience with community-created verb packs."
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<header class="hero">
  <div class="container">
    <h1 class="hero__title">Claude Verbs</h1>
    <p class="hero__tagline">Themed spinner verb sets for Claude Code</p>
    <p class="hero__desc">
      Claude Code shows a spinner while it thinks. By default it cycles through generic verbs like
      &ldquo;Thinking&rdquo; and &ldquo;Analyzing&rdquo;.
      <strong>Claude Verbs</strong> lets you replace those with themed sets &mdash; from Dutch TV
      references to studio chaos.
    </p>
  </div>
</header>

<main>
  <section class="gallery" aria-label="Verb set gallery">
    <div class="container">
      <h2 class="gallery__heading">Browse Sets</h2>
      <Gallery sets={data.sets} authors={data.authors} preferredLang={data.preferredLang} />
    </div>
  </section>

  <section class="install" aria-label="Installation instructions">
    <div class="container">
      <h2 class="install__heading">Install</h2>
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
    <div class="container">
      <h2 class="contribute__heading">Create Your Own</h2>
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
        <a href="https://github.com/doublej/claude-verbs-cli/blob/main/CONTRIBUTING.md">
          Read the Contributing Guide
        </a>
      </div>
    </div>
  </section>

  <section class="contributors-section" aria-label="Contributors">
    <div class="container">
      <Contributors usernames={data.contributors} authors={data.authors} />
    </div>
  </section>
</main>

<footer>
  <div class="container">
    <span>Made with <span aria-label="cursor">_</span> by JJ</span>
    <span class="footer__sep">|</span>
    <a href="https://github.com/doublej/claude-verbs">GitHub</a>
  </div>
</footer>

<style>
  :global(*, *::before, *::after) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    font-family: var(--mono);
    background: transparent;
    color: var(--text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .container {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  section {
    padding: 4rem 0;
  }

  /* ---- Hero ---- */

  .hero {
    text-align: center;
    padding: 6rem 0 4rem;
  }

  .hero__title {
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .hero__title::before {
    content: '> ';
    color: var(--text-faint);
  }

  .hero__tagline {
    font-size: clamp(0.85rem, 2vw, 1.05rem);
    color: var(--text-muted);
    margin-bottom: 2.5rem;
    font-weight: 400;
  }

  .hero__desc {
    max-width: 560px;
    margin: 0 auto;
    color: var(--text-muted);
    font-size: 0.82rem;
    line-height: 1.7;
  }

  /* ---- Gallery ---- */

  .gallery__heading,
  .install__heading {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 2rem;
    text-align: center;
  }

  .gallery__heading::before,
  .install__heading::before {
    content: '# ';
    color: var(--text-faint);
  }

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

  .terminal__dot {
    width: 10px;
    height: 10px;
    border-radius: 0;
    background: var(--border);
  }

  .terminal__dot--red {
    background: var(--text-faint);
  }

  .terminal__dot--yellow {
    background: var(--text-faint);
  }

  .terminal__dot--green {
    background: var(--text-faint);
  }

  .terminal__body {
    padding: 1.25rem;
    font-size: 0.82rem;
    line-height: 2;
  }

  .terminal__line::before {
    content: '$ ';
    color: var(--accent);
  }

  .terminal__comment {
    color: var(--text-faint);
  }

  .terminal__comment::before {
    content: '# ';
  }

  /* ---- Contribute ---- */

  .contribute {
    padding-top: 2rem;
  }

  .contribute__heading {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 1rem;
    text-align: center;
  }

  .contribute__heading::before {
    content: '# ';
    color: var(--text-faint);
  }

  .contribute__sub {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-bottom: 2rem;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    max-width: 680px;
    margin: 0 auto 2rem;
  }

  .step {
    background: color-mix(in srgb, var(--bg-raised) 70%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    border-radius: 0;
    padding: 1.25rem;
    text-align: center;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
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

  .contribute__link {
    display: block;
    text-align: center;
  }

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

  /* ---- Footer ---- */

  footer {
    padding: 2rem 0;
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-faint);
  }

  footer a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
  }

  footer a:hover {
    color: var(--accent);
  }

  footer .footer__sep {
    margin: 0 0.5rem;
  }

  /* ---- Responsive ---- */

  @media (max-width: 600px) {
    section {
      padding: 2.5rem 0;
    }

    .hero {
      padding: 3.5rem 0 2.5rem;
    }

    .steps {
      grid-template-columns: 1fr;
    }
  }
</style>
