import type { Params } from './params'

const MAX_ZOOM = 5
const DEBOUNCE_MS = 150
const SPRING_STIFFNESS = 0.08
const SPRING_DAMPING = 0.72
const SPRING_REST_THRESHOLD = 0.001
const SCROLL_SENSITIVITY = 0.003

export interface ScrollZoomController {
  cleanup: () => void
}

export function createScrollZoomController(
  params: Params,
  updateCamera: () => void,
): ScrollZoomController {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let springRaf = 0
  let velocity = 0
  let snapping = false

  function startSpring() {
    if (springRaf) return
    snapping = true
    velocity = 0
    tickSpring()
  }

  function tickSpring() {
    const displacement = params.scrollZoom - 1
    velocity = (velocity + displacement * SPRING_STIFFNESS) * SPRING_DAMPING
    params.scrollZoom -= velocity
    updateCamera()

    if (
      Math.abs(displacement) < SPRING_REST_THRESHOLD &&
      Math.abs(velocity) < SPRING_REST_THRESHOLD
    ) {
      params.scrollZoom = 1
      updateCamera()
      springRaf = 0
      snapping = false
      return
    }
    springRaf = requestAnimationFrame(tickSpring)
  }

  function stopSpring() {
    if (springRaf) cancelAnimationFrame(springRaf)
    springRaf = 0
    snapping = false
    velocity = 0
  }

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()

    if (snapping) stopSpring()
    if (debounceTimer) clearTimeout(debounceTimer)

    // Velocity-aware: larger scroll gestures zoom more
    const delta = -e.deltaY * SCROLL_SENSITIVITY
    if (delta > 0) {
      params.scrollZoom = Math.min(MAX_ZOOM, params.scrollZoom + delta)
      updateCamera()
    }

    debounceTimer = setTimeout(startSpring, DEBOUNCE_MS)
  }

  window.addEventListener('wheel', onWheel, { passive: false })

  return {
    cleanup: () => {
      window.removeEventListener('wheel', onWheel)
      if (debounceTimer) clearTimeout(debounceTimer)
      stopSpring()
    },
  }
}
