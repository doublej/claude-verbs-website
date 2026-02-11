import type { Container } from 'pixi.js'

const MAX_ZOOM = 2.5
const HOLD_MS = 600
const EASE_SPEED = 0.04
const REST_THRESHOLD = 0.002
const SCROLL_SENSITIVITY = 0.0015

export interface ScrollZoomController {
  cleanup: () => void
}

export function createScrollZoomController(
  wrap: Container,
  canvas: HTMLCanvasElement,
): ScrollZoomController {
  let holdTimer: ReturnType<typeof setTimeout> | null = null
  let easeRaf = 0
  let zoom = 1

  function applyZoom(pivotX: number, pivotY: number) {
    wrap.pivot.set(pivotX, pivotY)
    wrap.position.set(pivotX, pivotY)
    wrap.scale.set(zoom)
  }

  function startEaseBack() {
    if (easeRaf) return
    tickEase()
  }

  function tickEase() {
    // Smooth deceleration — lerp towards 1, no overshoot
    zoom += (1 - zoom) * EASE_SPEED
    wrap.scale.set(zoom)

    if (Math.abs(zoom - 1) < REST_THRESHOLD) {
      zoom = 1
      wrap.scale.set(1)
      wrap.pivot.set(0, 0)
      wrap.position.set(0, 0)
      easeRaf = 0
      return
    }
    easeRaf = requestAnimationFrame(tickEase)
  }

  function stopEase() {
    if (easeRaf) cancelAnimationFrame(easeRaf)
    easeRaf = 0
  }

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()

    stopEase()
    if (holdTimer) clearTimeout(holdTimer)

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const cursorX = (((e.clientX - rect.left) / rect.width) * canvas.width) / dpr
    const cursorY = (((e.clientY - rect.top) / rect.height) * canvas.height) / dpr

    const delta = -e.deltaY * SCROLL_SENSITIVITY
    if (delta > 0) {
      zoom = Math.min(MAX_ZOOM, zoom + delta)
      applyZoom(cursorX, cursorY)
    }

    holdTimer = setTimeout(startEaseBack, HOLD_MS)
  }

  window.addEventListener('wheel', onWheel, { passive: false })

  return {
    cleanup: () => {
      window.removeEventListener('wheel', onWheel)
      if (holdTimer) clearTimeout(holdTimer)
      stopEase()
    },
  }
}
