export const SPINNER_FRAMES = ['·', '✻', '✽', '✶', '✳', '✢']
export const SPINNER_TIMELINE = [0, 0, 1, 2, 3, 4, 5, 5]
export const FONT_FAMILY = '"SF Mono", "Fira Code", "Cascadia Code", monospace'

function isLight(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.getAttribute('data-theme') === 'light'
}

/** Centralised color palette — reads theme at access time so it stays in sync. */
export const PALETTE = {
  get border() {
    return isLight() ? 0xd0d7de : 0x30363d
  },
  get dim() {
    return isLight() ? 0x6e7781 : 0x6e7681
  },
  get lineNum() {
    return isLight() ? 0x9ca3af : 0x484f58
  },
  get tool() {
    return isLight() ? 0x57606a : 0x8b949e
  },
  get path() {
    return isLight() ? 0x24292f : 0xc9d1d9
  },
  get ok() {
    return isLight() ? 0x22c55e : 0x4ade80
  },
  get warn() {
    return isLight() ? 0xd97706 : 0xd29922
  },
  get error() {
    return isLight() ? 0xdc2626 : 0xf85149
  },
  get prompt() {
    return isLight() ? 0x7c3aed : 0xbc8cff
  },
  get accent() {
    return isLight() ? 0x0969da : 0x79c0ff
  },
  get suggestion() {
    return isLight() ? 0x8b8b8b : 0x555555
  },
  get active() {
    return isLight() ? 0x000000 : 0xffffff
  },
  get deadPixel() {
    return isLight() ? '#d0d0d0' : '#0a0c10'
  },
  get deadPixelRed() {
    return isLight() ? '#e8a0a0' : '#3a0808'
  },
  get deadPixelBlue() {
    return isLight() ? '#a0a0e8' : '#08083a'
  },
  get deadPixelGreen() {
    return isLight() ? '#a0e8a0' : '#083a08'
  },
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
  deadPixelCount: 12,
  deadPixelSize: 3,
  glareWidth: 0.6,
  glareHeight: 0.4,
  lcdGrid: 4.0,
}
