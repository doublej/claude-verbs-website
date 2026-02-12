import { SEQUENCE } from './config'

export interface Params {
  frameMs: number
  verbMs: number
  scrollMs: number
  demoTimeoutMs: number
  charDwellMs: number
  tokenRate: number
  colorVerb: string
  colorVerbHighlight: string
  colorEllipsis: string
  bgColor: string
  colorHighlight: string
  perspective: number
  rotateX: number
  rotateY: number
  rotateZ: number
  scale: number
  translateX: number
  translateY: number
  mouseTranslateX: number
  mouseTranslateY: number
  originX: number
  originY: number
  displayDownscale: number
  imageRendering: string
  fontSize: number
  lineHeightOffset: number
  lcdEnabled: boolean
  deadPixelsEnabled: boolean
  offsetX: number
  offsetY: number
  absoluteX: number
  absoluteY: number
  flickerNormalPct: number
  flickerMaxYLines: number
  flickerGhostAlphaMin: number
  bloomEnabled: boolean
  bloomStrength: number
  bloomQuality: number
  brightness: number
  saturation: number
  exposure: number
  zoom: number
  mouseZoom: number
  focusTargetX: number
  focusTargetY: number
  focusStrength: number
  screenPadding: number
}

export function displaySize(viewW: number, viewH: number, downscale: number): [number, number] {
  return [Math.ceil(viewW / downscale), Math.ceil(viewH / downscale)]
}

function getTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark'
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' ? 'light' : 'dark'
}

export function createParams(): Params {
  const theme = getTheme()
  const isLight = theme === 'light'

  return {
    frameMs: 100,
    verbMs: 4500,
    scrollMs: 350,
    demoTimeoutMs: 24 * 60 * 60 * 1000,
    charDwellMs: 550,
    tokenRate: 70,
    colorVerb: isLight ? '#b45454' : '#d78787',
    colorVerbHighlight: isLight ? '#b8960a' : '#fde047',
    colorEllipsis: isLight ? '#737373' : '#a2a2a2',
    bgColor: isLight ? '#f5f5f5' : '#0d1117',
    colorHighlight: isLight ? '#e0d9c2' : '#56533e',
    perspective: 3000, // CAMERA_DEFAULTS.perspective
    rotateX: 5, // CAMERA_DEFAULTS.rotateX
    rotateY: 8, // CAMERA_DEFAULTS.rotateY
    rotateZ: -4, // CAMERA_DEFAULTS.rotateZ
    scale: 1,
    translateX: 0,
    translateY: 0,
    mouseTranslateX: 0,
    mouseTranslateY: 0,
    originX: 4.8, // CAMERA_DEFAULTS.originX
    originY: 5.3, // CAMERA_DEFAULTS.originY
    displayDownscale: 0.5,
    imageRendering: 'pixelated',
    fontSize: 48,
    lineHeightOffset: 4,
    lcdEnabled: true,
    deadPixelsEnabled: true,
    offsetX: 0,
    offsetY: 0,
    absoluteX: 15,
    absoluteY: 0,
    flickerNormalPct: 20,
    flickerMaxYLines: 4,
    flickerGhostAlphaMin: 0.3,
    bloomEnabled: true,
    bloomStrength: 2,
    bloomQuality: 2,
    brightness: 1,
    saturation: 1,
    exposure: 1,
    zoom: SEQUENCE.zoom.initial,
    mouseZoom: 1,
    focusTargetX: 0,
    focusTargetY: 0,
    focusStrength: 0,
    screenPadding: 0.15,
  }
}
