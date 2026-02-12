import type { VerbSet } from '$lib/data/types'
import type { Container, Text } from 'pixi.js'
import { resetDemoState } from './app-helpers'
import { countColumns } from './helpers'
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

/** Override params for a flat, zoomed-in mobile view. */
export function applyMobileOverrides(params: Params): void {
  params.rotateX = 0
  params.rotateY = 0
  params.rotateZ = 0
  params.zoom = 1
  params.screenPadding = 0.05
  params.absoluteX = 0
  params.absoluteY = 0
  params.offsetX = 3
  params.offsetY = -2
  params.lcdEnabled = true
  params.deadPixelsEnabled = false
  params.bloomStrength = 1
  params.displayDownscale = 0.5
  params.fontSize = 36
  params.lineHeightOffset = 2
}

/** Minimal layout: centre spinner + meta, hide everything else. */
export function layoutMobile(
  screenW: number,
  screenH: number,
  lctx: LayoutCtx,
  ui: {
    spinnerLine: Container
    metaLine: Container
    scrollContainer: Container
    bottomChrome: Container
    inputContainer: Container
    verbText: Text
    ellipsisText: Text
  },
): void {
  const { chW, lineHeight: lh } = lctx
  const col3 = Math.round(3 * chW)

  ui.inputContainer.visible = false
  ui.scrollContainer.visible = false
  ui.bottomChrome.visible = false
  ui.spinnerLine.visible = true
  ui.metaLine.visible = true

  const verbW = Math.round(countColumns(ui.verbText.text) * chW)
  const ellipsisW = Math.round(countColumns(ui.ellipsisText.text) * chW)
  const spinnerW = col3 + verbW + ellipsisW + Math.round(chW)
  const spinnerX = Math.max(0, Math.round((screenW - spinnerW) / 2))
  const spinnerY = Math.round(screenH / 2 - lh)

  ui.spinnerLine.x = spinnerX
  ui.spinnerLine.y = spinnerY
  ui.verbText.x = col3
  ui.ellipsisText.x = ui.verbText.x + verbW

  ui.metaLine.x = spinnerX + col3
  ui.metaLine.y = spinnerY + 2 * lh
}

interface MobileContext {
  machine: Machine
  localeSets: VerbSet[]
  ts: TickerState
  s: SceneRefs
  params: Params
  scrollItems: (Text | Container)[]
  pool: TextPool
  canvas: HTMLCanvasElement
}

/** Start mobile demo with first locale set and wire up tap-to-cycle. */
export function initMobileDemo(ctx: MobileContext): () => void {
  const { machine, localeSets, ts, s, params, scrollItems, pool, canvas } = ctx
  const firstSet = localeSets[0] ?? null
  if (firstSet) {
    machine.activeSet = firstSet
    machine.hasSubmitted = true
    machine.current = State.DEMO
    resetDemoState(firstSet, ts, s, params, scrollItems, pool)
  }
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
