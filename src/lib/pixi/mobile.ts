import type { VerbSet } from '$lib/data/types'
import type { Container, Text } from 'pixi.js'
import { resetDemoState } from './app-helpers'
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

/** Start mobile demo with first locale set and wire up tap-to-cycle. */
export function initMobileDemo(ctx: MobileContext): () => void {
  const { machine, localeSets, ts, s, params, lctx, scrollItems, pool, canvas } = ctx
  const firstSet = localeSets[0] ?? null
  if (firstSet) {
    machine.activeSet = firstSet
    machine.hasSubmitted = true
    machine.current = State.DEMO
    resetDemoState(firstSet, ts, s, params, scrollItems, pool)
  }

  setMarketplaceHint(s, lctx)
  ts.layoutDirty = true

  const onTap = () => {
    if (localeSets.length <= 1) return
    machine.browseIndex = (machine.browseIndex + 1) % localeSets.length
    const nextSet = localeSets[machine.browseIndex]
    machine.activeSet = nextSet
    resetDemoState(nextSet, ts, s, params, scrollItems, pool)
    ts.layoutDirty = true
  }
  canvas.addEventListener('pointerup', onTap)
  return onTap
}
