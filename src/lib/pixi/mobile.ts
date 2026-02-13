import type { VerbSet } from '$lib/data/types'
import type { Container, Text } from 'pixi.js'
import { resetDemoState } from './app-helpers'
import { type BrightnessBar, adjustBrightness } from './brightness-bar'
import { PALETTE } from './constants'
import type { LayoutCtx } from './layout'
import type { Params } from './params'
import type { SceneRefs } from './scene'
import { type Machine, State } from './state-machine'
import type { TextPool } from './text-pool'
import type { TickerState } from './ticker'

const MOBILE_BREAKPOINT = 768

export function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
}

interface MobileContext {
  machine: Machine
  localeSets: VerbSet[]
  ts: TickerState
  s: SceneRefs
  params: Params
  lctx: LayoutCtx
  scrollItems: (Text | Container)[]
  pool: TextPool
  brightnessBar: BrightnessBar
  syncParamsToScene: () => void
  canvas: HTMLCanvasElement
}

function setMarketplaceHint(s: SceneRefs, lctx: LayoutCtx): void {
  const msg = 'check back on desktop for the marketplace'
  const border = '\u2500'.repeat(msg.length + 2)
  s.ruleTop.text = `\u250c${border}\u2510`
  s.ruleTop.style.fill = PALETTE.dim
  s.promptText.text = `\u2502 ${msg} \u2502`
  s.promptText.style.fill = PALETTE.dim
  s.ruleBottom.text = `\u2514${border}\u2518`
  s.ruleBottom.style.fill = PALETTE.dim
  // Lock prevRuleCols so layout never overwrites our custom rule text
  const ruleCols = Math.max(1, Math.floor(s.contentW / lctx.chW) - 2)
  lctx.prevRuleCols = ruleCols
  // Shift chrome 1 line up (closer to spinner)
  lctx.chromeOffsetY = -lctx.lineHeight
}

const SWIPE_THRESHOLD = 8

function bindBrightnessSwipe(
  canvas: HTMLCanvasElement,
  bar: BrightnessBar,
  params: Params,
  sync: () => void,
): () => void {
  let startY = 0
  let accumulated = 0

  const onStart = (e: TouchEvent) => {
    startY = e.touches[0].clientY
    accumulated = 0
  }
  const onMove = (e: TouchEvent) => {
    e.preventDefault()
    const dy = startY - e.touches[0].clientY
    accumulated += dy
    startY = e.touches[0].clientY
    const steps = Math.trunc(accumulated / SWIPE_THRESHOLD)
    if (steps !== 0) {
      accumulated -= steps * SWIPE_THRESHOLD
      params.userBrightness = adjustBrightness(bar, steps)
      sync()
    }
  }
  canvas.addEventListener('touchstart', onStart, { passive: true })
  canvas.addEventListener('touchmove', onMove, { passive: false })
  return () => {
    canvas.removeEventListener('touchstart', onStart)
    canvas.removeEventListener('touchmove', onMove)
  }
}

/** Start mobile demo with first locale set and brightness swipe. */
export function initMobileDemo(ctx: MobileContext): () => void {
  const { machine, localeSets, ts, s, params, lctx, scrollItems, pool } = ctx
  const firstSet = localeSets[0] ?? null
  if (firstSet) {
    machine.activeSet = firstSet
    machine.hasSubmitted = true
    machine.current = State.DEMO
    resetDemoState(firstSet, ts, s, params, scrollItems, pool)
  }

  setMarketplaceHint(s, lctx)
  ts.layoutDirty = true

  return bindBrightnessSwipe(ctx.canvas, ctx.brightnessBar, params, ctx.syncParamsToScene)
}
