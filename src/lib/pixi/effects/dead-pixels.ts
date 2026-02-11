import { EFFECT_DEFAULTS, PALETTE } from '../constants'

/** Dark dead pixels (rendered with multiply blend to darken content). */
const DARK_PIXELS: Record<number, string> = {
  3: PALETTE.deadPixelRed,
  7: PALETTE.deadPixelBlue,
  10: PALETTE.deadPixelGreen,
}

/** Stuck-on red pixels — always glow red regardless of content. */
const STUCK_RED_INDICES = new Set([4, 9])

function snapToGrid(v: number, grid: number): number {
  return Math.floor(v / grid) * grid
}

interface DeadPixelLayers {
  dark: HTMLCanvasElement
  stuck: HTMLCanvasElement
}

/** Build two canvases: dark dead pixels + stuck-on red pixels, both LCD-grid-aligned. */
export function buildDeadPixelLayers(w: number, h: number, enabled: boolean): DeadPixelLayers {
  const dark = document.createElement('canvas')
  const stuck = document.createElement('canvas')
  dark.width = w
  dark.height = h
  stuck.width = w
  stuck.height = h
  if (!enabled) return { dark, stuck }

  const darkCtx = dark.getContext('2d')!
  const stuckCtx = stuck.getContext('2d')!
  const grid = EFFECT_DEFAULTS.lcdGrid

  for (let i = 0; i < EFFECT_DEFAULTS.deadPixelCount; i++) {
    const rawX = (0.15 + Math.random() * 0.7) * w
    const rawY = (0.1 + Math.random() * 0.6) * h
    const x = snapToGrid(rawX, grid)
    const y = snapToGrid(rawY, grid)

    if (STUCK_RED_INDICES.has(i)) {
      stuckCtx.fillStyle = '#ff0000'
      stuckCtx.fillRect(x, y, grid, grid)
    } else {
      darkCtx.fillStyle = DARK_PIXELS[i] ?? PALETTE.deadPixel
      darkCtx.fillRect(x, y, grid, grid)
    }
  }
  return { dark, stuck }
}
