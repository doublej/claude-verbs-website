<script lang="ts">
import Gallery from '$lib/components/Gallery.svelte'
import type { PageData } from './$types'
const { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Claude Verbs</title>
  <meta name="description" content="Replace boring spinner text with themed verb sets." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
</svelte:head>

<main class="page">
  <section class="hero">
    <div class="fr">
      <div class="badge"><span class="badge-i">⠋</span><span>Open Source</span></div>
      <h1 class="title">Claude Verbs</h1>
      <p class="tag">Themed spinner text for Claude Code</p>
      <div class="pv"><div class="pv-l"><span class="pv-s">⠙</span><span class="pv-t">Contemplating existence...</span><span class="pv-c"></span></div></div>
      <p class="desc">Replace the default thinking text with curated verb sets. Philosophical musings, coffee metaphors, or chaotic energy — pick your vibe.</p>
    </div>
  </section>

  <section class="browse" id="browse">
    <div class="fr">
      <header class="sh"><h2 class="st">Browse Sets</h2><p class="ss">Find a set that matches your style</p></header>
      <Gallery sets={data.sets} authors={data.authors} preferredLang={data.preferredLang} />
    </div>
  </section>

  <section class="install">
    <div class="fr">
      <header class="sh"><h2 class="st">Install</h2><p class="ss">One command, new personality</p></header>
      <div class="term">
        <div class="term-h"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="term-t">terminal</span></div>
        <div class="term-b">
          <div class="tg"><div class="tc"># list available sets</div><div class="tl">bunx github:doublej/claude-verbs-cli list</div></div>
          <div class="tg"><div class="tc"># install a set</div><div class="tl">bunx github:doublej/claude-verbs-cli install &lt;name&gt;</div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="contrib">
    <div class="fr">
      <header class="sh"><h2 class="st">Create Your Own</h2><p class="ss">Add your personality in three steps</p></header>
      <div class="steps">
        <div class="step"><div class="sm"><span class="sn">1</span><span class="sl"></span></div><div class="sc"><h3 class="stt">Fork</h3><p class="sd">Fork doublej/claude-verbs and clone locally</p></div></div>
        <div class="step"><div class="sm"><span class="sn">2</span><span class="sl"></span></div><div class="sc"><h3 class="stt">Create</h3><p class="sd">Add your JSON file with verbs</p></div></div>
        <div class="step"><div class="sm"><span class="sn">3</span></div><div class="sc"><h3 class="stt">PR</h3><p class="sd">Open a pull request</p></div></div>
      </div>
      <div class="cta"><a class="cta-l" href="https://github.com/doublej/claude-verbs/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener"><span>Read Contributing Guide</span><span class="cta-a">→</span></a></div>
    </div>
  </section>
</main>

<footer class="ft"><div class="fr"><div class="ft-c"><span>Made with <span class="ft-cur">_</span> by JJ</span><span class="ft-d">│</span><a class="ft-l" href="https://github.com/doublej/claude-verbs">GitHub</a></div></div></footer>

<style>
  :global(*), :global(*::before), :global(*::after) { margin: 0; padding: 0; box-sizing: border-box; }
  :global(html) { scroll-behavior: smooth; }
  :global(body) { font-family: var(--mono); background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }
  .page { min-height: 100vh; }
  .fr { max-width: var(--max-w); margin: 0 auto; padding: 0 1.5rem; }
  .hero { padding: 4rem 0 3rem; text-align: center; }
  .badge { display: inline-flex; align-items: center; gap: 0.5rem; font: 600 0.72rem var(--mono); color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); padding: 0.4rem 0.875rem; margin-bottom: 1.5rem; letter-spacing: 0.02em; }
  .badge-i { font-size: 0.85rem; }
  .title { font: 700 clamp(2rem, 8vw, 3.5rem) var(--display); color: var(--text); line-height: 1.1; margin-bottom: 0.5rem; }
  .tag { font: 400 clamp(0.9rem, 3vw, 1.1rem) var(--mono); color: var(--text-muted); margin-bottom: 2rem; }
  .pv { display: inline-block; background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 0.875rem 1.5rem; margin-bottom: 2rem; }
  .pv-l { display: flex; align-items: center; gap: 0.5rem; font: 400 0.85rem var(--mono); }
  .pv-s { color: var(--accent); font-weight: 700; }
  .pv-t { color: var(--text-muted); }
  .pv-c { width: 0.5ch; height: 1em; background: var(--accent); animation: blink 1s step-end infinite; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .desc { max-width: 480px; margin: 0 auto; font: 400 0.82rem var(--mono); color: var(--text-muted); line-height: 1.7; }
  section { padding: 3rem 0; }
  .sh { text-align: center; margin-bottom: 2rem; }
  .st { font: 700 clamp(1.25rem, 4vw, 1.75rem) var(--display); color: var(--text); margin-bottom: 0.35rem; }
  .ss { font: 400 0.82rem var(--mono); color: var(--text-muted); }
  .term { max-width: 560px; margin: 0 auto; background: var(--bg-surface); border: 1px solid var(--border); overflow: hidden; }
  .term-h { display: flex; align-items: center; gap: 6px; padding: 0.75rem 1rem; background: var(--bg-raised); border-bottom: 1px solid var(--border-subtle); }
  .dot { width: 8px; height: 8px; background: var(--text-faint); opacity: 0.5; }
  .term-t { margin-left: auto; font: 400 0.65rem var(--mono); color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.1em; }
  .term-b { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .tg { display: flex; flex-direction: column; gap: 0.25rem; }
  .tc { font: 400 0.78rem var(--mono); color: var(--text-faint); }
  .tl { font: 400 0.82rem var(--mono); color: var(--text); }
  .tl::before { content: '$ '; color: var(--accent); font-weight: 700; }
  .steps { display: flex; flex-direction: column; max-width: 400px; margin: 0 auto 2rem; }
  .step { display: flex; gap: 1rem; }
  .sm { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .sn { width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; font: 700 0.85rem var(--display); color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); }
  .sl { width: 1px; flex: 1; min-height: 1.5rem; background: var(--border-subtle); }
  .sc { padding-bottom: 1.5rem; }
  .stt { font: 700 0.9rem var(--display); color: var(--text); margin-bottom: 0.25rem; }
  .sd { font: 400 0.78rem var(--mono); color: var(--text-muted); line-height: 1.5; }
  .cta { text-align: center; }
  .cta-l { display: inline-flex; align-items: center; gap: 0.5rem; font: 600 0.82rem var(--mono); color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); padding: 0.75rem 1.5rem; text-decoration: none; transition: all 0.15s; }
  .cta-l:hover { background: color-mix(in srgb, var(--accent) 15%, transparent); border-color: var(--accent); }
  .cta-a { transition: transform 0.15s; }
  .cta-l:hover .cta-a { transform: translateX(2px); }
  .ft { padding: 2rem 0 3rem; border-top: 1px solid var(--border-subtle); }
  .ft-c { display: flex; align-items: center; justify-content: center; gap: 0.5rem; font: 400 0.75rem var(--mono); color: var(--text-faint); }
  .ft-cur { color: var(--accent); }
  .ft-d { color: var(--border); }
  .ft-l { color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
  .ft-l:hover { color: var(--accent); }
  @media (max-width: 640px) { .hero { padding: 3rem 0 2rem; } .pv { padding: 0.75rem 1rem; } section { padding: 2rem 0; } }
</style>
