import { Container, Graphics, Text } from 'pixi.js'
import { FONT_FAMILY, PALETTE } from './constants'

const TOTAL_BLOCKS = 10
const DEFAULT_LEVEL = 5
const MIN_MULT = 0.4
const MAX_MULT = 1.8
const STEP = (MAX_MULT - MIN_MULT) / TOTAL_BLOCKS
const IDLE_ALPHA = 0.12
const ACTIVE_ALPHA = 0.6
const FADE_MS = 1500

export interface BrightnessBar {
  container: Container
  track: Graphics
  fill: Graphics
  level: number
  multiplier: number
  alpha: number
  fadeStart: number
  chW: number
  blockH: number
  barH: number
  gap: number
  dimAnim: DimAnim | null
}

interface DimAnim {
  targetLevel: number
  stepMs: number
  lastStep: number
  onStep: (multiplier: number) => void
}

export function createBrightnessBar(
  fontSize: number,
  chW: number,
  contentH: number,
): BrightnessBar {
  const container = new Container({ label: 'brightnessBar' })
  container.alpha = IDLE_ALPHA

  const blockH = Math.round(chW)
  const gap = 2
  const barH = TOTAL_BLOCKS * (blockH + gap) - gap
  const barW = Math.round(chW * 1.5)

  const sunLarge = new Text({
    text: '\u2600',
    style: { fontFamily: FONT_FAMILY, fontSize: Math.round(fontSize * 3.2), fill: PALETTE.border },
    label: 'brtSunLarge',
  })
  sunLarge.x = Math.round((barW - sunLarge.width) / 2)
  sunLarge.y = 0
  container.addChild(sunLarge)

  const trackY = Math.round(sunLarge.height + gap * 2)
  const track = new Graphics({ label: 'brtTrack' })
  track.rect(0, 0, barW, barH)
  track.fill({ color: PALETTE.border, alpha: 0.3 })
  track.x = 0
  track.y = trackY
  container.addChild(track)

  const fill = new Graphics({ label: 'brtFill' })
  fill.x = 0
  fill.y = trackY
  container.addChild(fill)

  const sunSmall = new Text({
    text: '\u2600',
    style: { fontFamily: FONT_FAMILY, fontSize: Math.round(fontSize * 2.0), fill: PALETTE.border },
    label: 'brtSunSmall',
  })
  sunSmall.x = Math.round((barW - sunSmall.width) / 2)
  sunSmall.y = trackY + barH + gap * 2
  container.addChild(sunSmall)

  const bar: BrightnessBar = {
    container,
    track,
    fill,
    level: DEFAULT_LEVEL,
    multiplier: 1.0,
    alpha: IDLE_ALPHA,
    fadeStart: 0,
    chW,
    blockH,
    barH,
    gap,
    dimAnim: null,
  }
  redrawFill(bar)
  return bar
}

export function adjustBrightness(bar: BrightnessBar, delta: number): number {
  bar.level = Math.max(0, Math.min(TOTAL_BLOCKS, bar.level + delta))
  bar.multiplier = MIN_MULT + bar.level * STEP
  bar.alpha = ACTIVE_ALPHA
  bar.fadeStart = Date.now()
  bar.container.alpha = ACTIVE_ALPHA
  redrawFill(bar)
  return bar.multiplier
}

export function startDimAnimation(
  bar: BrightnessBar,
  targetLevel: number,
  stepMs: number,
  onStep: (multiplier: number) => void,
): void {
  bar.alpha = ACTIVE_ALPHA
  bar.fadeStart = 0
  bar.container.alpha = ACTIVE_ALPHA
  bar.dimAnim = { targetLevel, stepMs, lastStep: Date.now(), onStep }
}

export function tickBrightnessBar(bar: BrightnessBar): void {
  if (bar.dimAnim) {
    tickDimAnim(bar)
    return
  }
  if (bar.fadeStart === 0) return
  const elapsed = Date.now() - bar.fadeStart
  if (elapsed >= FADE_MS) {
    bar.alpha = IDLE_ALPHA
    bar.fadeStart = 0
  } else {
    bar.alpha = ACTIVE_ALPHA - (ACTIVE_ALPHA - IDLE_ALPHA) * (elapsed / FADE_MS)
  }
  bar.container.alpha = bar.alpha
}

function tickDimAnim(bar: BrightnessBar): void {
  const anim = bar.dimAnim as DimAnim
  const now = Date.now()
  if (now - anim.lastStep < anim.stepMs) return
  anim.lastStep = now
  bar.level = Math.max(anim.targetLevel, bar.level - 1)
  bar.multiplier = MIN_MULT + bar.level * STEP
  redrawFill(bar)
  anim.onStep(bar.multiplier)
  if (bar.level <= anim.targetLevel) {
    bar.dimAnim = null
    bar.fadeStart = Date.now()
  }
}

function redrawFill(bar: BrightnessBar): void {
  bar.fill.clear()
  if (bar.level <= 0) return
  const barW = bar.track.width
  for (let i = 0; i < bar.level; i++) {
    const y = bar.barH - (i + 1) * (bar.blockH + bar.gap) + bar.gap
    bar.fill.rect(0, y, barW, bar.blockH)
  }
  bar.fill.fill({ color: PALETTE.prompt })
}
