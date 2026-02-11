<script lang="ts">
import { onMount } from 'svelte'

const { verbs }: { verbs: string[] } = $props()

const SPINNER_CHARS = ['|', '/', '-', '\\']

let currentVerb = $state('Loading...')
let spinnerChar = $state('|')

onMount(() => {
  const shuffled = [...verbs]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  if (shuffled.length === 0) {
    shuffled.push('Thinking...', 'Processing...')
  }

  let verbIdx = 0
  let charIdx = 0
  currentVerb = shuffled[0]

  const verbTimer = setInterval(() => {
    verbIdx = (verbIdx + 1) % shuffled.length
    currentVerb = shuffled[verbIdx]
  }, 2200)

  const charTimer = setInterval(() => {
    charIdx = (charIdx + 1) % SPINNER_CHARS.length
    spinnerChar = SPINNER_CHARS[charIdx]
  }, 200)

  return () => {
    clearInterval(verbTimer)
    clearInterval(charTimer)
  }
})
</script>

<div class="spinner" aria-live="polite" aria-label="Animated spinner verb demo">
  <span class="spinner__icon" aria-hidden="true">{spinnerChar}</span>
  <span class="spinner__verb">{currentVerb}</span>
  <span class="spinner__cursor" aria-hidden="true"></span>
</div>

<style>
  .spinner {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: color-mix(in srgb, var(--bg-raised) 70%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    border-radius: 6px;
    padding: 0.85rem 1.5rem;
    margin-bottom: 2rem;
    min-height: 3.2rem;
    font-size: clamp(0.8rem, 1.8vw, 0.95rem);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .spinner__icon {
    color: var(--accent);
    font-weight: 700;
    width: 1ch;
    display: inline-block;
    text-align: center;
  }

  .spinner__verb {
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
  }

  .spinner__cursor {
    display: inline-block;
    width: 0.6ch;
    height: 1.15em;
    background: var(--accent);
    vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  @media (max-width: 600px) {
    .spinner {
      padding: 0.65rem 1rem;
    }
  }
</style>
