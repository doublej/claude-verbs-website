<script lang="ts">
import { loadSets } from '$lib/data/sets'
import { createApp } from '$lib/pixi/app'
import { getResolvedTheme } from '$lib/theme.svelte'
import { onMount } from 'svelte'

let wrap: HTMLDivElement

onMount(() => {
  const sets = loadSets()
  let cleanup: (() => void) | undefined

  function init() {
    createApp(wrap, sets).then((fn) => {
      cleanup = fn
    })
  }

  init()

  // Recreate app when theme changes
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
</svelte:head>

<div bind:this={wrap} id="canvas-wrap"></div>

<a href="/marketplace" class="skip-btn">SKIP TO MARKETPLACE</a>

<style>
  :global(*),
  :global(*::before),
  :global(*::after) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    background: var(--bg-home);
    overflow: hidden;
    height: 100vh;
    transition: background-color 0.2s;
  }

  #canvas-wrap {
    position: fixed;
    inset: 0;
    overflow: hidden;
    z-index: 0;
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

  .skip-btn {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 40px;
    padding: 0 24px;
    background: rgba(22, 27, 34, 0.9);
    color: #c9d1d9;
    text-decoration: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    z-index: 20;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .skip-btn:hover {
    background: rgba(58, 158, 255, 0.15);
    color: #58a6ff;
  }
</style>
