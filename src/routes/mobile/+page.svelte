<script lang="ts">
import { loadSets } from '$lib/data/sets'
import { createApp } from '$lib/pixi/app'
import { onMount } from 'svelte'
import type { PageData } from './$types'

const { data }: { data: PageData } = $props()

let wrap: HTMLDivElement

onMount(() => {
  document.documentElement.setAttribute('data-theme', 'dark')

  const sets = loadSets()
  let handle: Awaited<ReturnType<typeof createApp>> | undefined

  createApp(wrap, sets, {
    demoMode: true,
    onMarketplace: () => {},
    onEscSkipActivated: () => {},
    onEscSkipProgress: () => {},
    preferredLang: data.preferredLang,
  }).then((h) => {
    handle = h
  })

  return () => handle?.cleanup()
})
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
		href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="mobile-frame">
	<div bind:this={wrap} class="canvas-wrap"></div>
</div>

<style>
	:global(*),
	:global(*::before),
	:global(*::after) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(html, body) {
		height: 100%;
		overflow: hidden;
		background: #000;
	}

	.mobile-frame {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
	}

	.canvas-wrap {
		width: 100%;
		height: 100%;
		border-radius: 3px;
		overflow: hidden;
		background: #000;
	}

	.canvas-wrap :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}
</style>
