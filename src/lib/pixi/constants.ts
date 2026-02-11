export const SPINNER_FRAMES = ['·', '✻', '✽', '✶', '✳', '✢']
export const SPINNER_TIMELINE = [0, 0, 1, 2, 3, 4, 5, 5]
export const FONT_FAMILY = '"SF Mono", "Fira Code", "Cascadia Code", monospace'

type Theme = 'light' | 'dark'

function getTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' ? 'light' : 'dark'
}

const theme = getTheme()
const isLight = theme === 'light'

/** Centralised color palette — single source of truth for all TUI colors. */
export const PALETTE = {
  border: isLight ? 0xd0d7de : 0x30363d,
  dim: isLight ? 0x6e7781 : 0x6e7681,
  lineNum: isLight ? 0x9ca3af : 0x484f58,
  tool: isLight ? 0x57606a : 0x8b949e,
  path: isLight ? 0x24292f : 0xc9d1d9,
  ok: isLight ? 0x22c55e : 0x4ade80,
  warn: isLight ? 0xd97706 : 0xd29922,
  error: isLight ? 0xdc2626 : 0xf85149,
  prompt: isLight ? 0x7c3aed : 0xbc8cff,
  accent: isLight ? 0x0969da : 0x79c0ff,
  suggestion: isLight ? 0x8b8b8b : 0x555555,
  active: isLight ? 0x000000 : 0xffffff,
  deadPixel: isLight ? '#d0d0d0' : '#0a0c10',
}

export const LAYOUT = {
  lineHeightRatio: 1.24,
  idleOffsetLines: -5,
  headerLeftCol: 38,
  panelWidth: 34,
  textPoolCap: 40,
  defaultCol: 3,
}

export const CAMERA_DEFAULTS = {
  gridDivisions: 32,
  perspective: 3000,
  rotateX: 5,
  rotateY: 8,
  rotateZ: -4,
  originX: 4.8,
  originY: 5.3,
}

export const MOUSE_DEFAULTS = {
  translateRange: 1.2,
  zoomFactor: 0.016,
  lerpFactor: 0.02,
}

export const EFFECT_DEFAULTS = {
  deadPixelCount: 2,
  deadPixelSize: 3,
  deadPixelSeed: 42,
  glareWidth: 0.6,
  glareHeight: 0.4,
  lcdGrid: 4.0,
}
