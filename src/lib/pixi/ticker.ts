import type { Container, Text } from 'pixi.js'
import { SEQUENCE } from './config'
import { SPINNER_FRAMES, SPINNER_TIMELINE } from './constants'
import { type FlickerState, applyFlicker } from './effects/flicker'
import { type LineBuffer, type LineDef, mkPromo, mkStateDiagram, nextLine } from './events'
import { fmtElapsed, shuffle } from './helpers'
import { type LayoutCtx, addScrollLine, layout } from './layout'
import type { Params } from './params'
import type { SceneRefs } from './scene'
import { type Machine, State, stateName } from './state-machine'
import type { TextPool } from './text-pool'

export interface TickerState {
  verbs: string[]
  verbIdx: number
  spinnerTick: number
  tokenCount: number
  startTime: number
  lastFrameTime: number
  lastVerbTime: number
  lastTokenTime: number
  lastScrollTime: number
  layoutDirty: boolean
  stateDiagramShown: boolean
  promoShown: boolean
}

export function createTickerState(): TickerState {
  return {
    verbs: [],
    verbIdx: 0,
    spinnerTick: 0,
    tokenCount: 0,
    startTime: Date.now(),
    lastFrameTime: 0,
    lastVerbTime: 0,
    lastTokenTime: 0,
    lastScrollTime: 0,
    layoutDirty: true,
    stateDiagramShown: false,
    promoShown: false,
  }
}

export function tickSpinner(now: number, ts: TickerState, s: SceneRefs, params: Params): void {
  if (now - ts.lastFrameTime < params.frameMs) return
  ts.spinnerTick++
  s.glyphText.text = SPINNER_FRAMES[SPINNER_TIMELINE[ts.spinnerTick % SPINNER_TIMELINE.length]]
  ts.lastFrameTime = now
}

export function tickScroll(
  now: number,
  ts: TickerState,
  s: SceneRefs,
  machine: Machine,
  params: Params,
  lineBuffer: LineDef[],
  bufState: LineBuffer,
  scrollItems: (Text | Container)[],
  pool: TextPool,
  lctx: LayoutCtx,
): void {
  if (!machine.hasSubmitted || machine.current === State.IDLE || machine.current === State.BROWSING)
    return

  const elapsed = now - ts.startTime
  if (!ts.stateDiagramShown && elapsed >= SEQUENCE.demo.stateDiagramMs) {
    const diagram = mkStateDiagram()
    lineBuffer.unshift(...diagram.lines)
    ts.stateDiagramShown = true
  }
  if (!ts.promoShown && elapsed >= SEQUENCE.demo.promoMs) {
    const promo = mkPromo()
    lineBuffer.unshift(...promo.lines)
    ts.promoShown = true
  }

  const scrollDelay =
    bufState.currentBurstMs > 0 && bufState.linesLeftInBurst > 0
      ? bufState.currentBurstMs
      : params.scrollMs
  if (now - ts.lastScrollTime >= scrollDelay) {
    const line = nextLine(lineBuffer, bufState, params)
    addScrollLine(line, scrollItems, s.scrollContainer, pool, lctx, s.spinnerLine.y)
    ts.lastScrollTime = now
    ts.layoutDirty = true
  }

  s.statusText.text = `\u2026/claude-verbs-website   main *5   [${stateName(machine.current)}]`
  s.permsText.text =
    '\u23f5\u23f5 bypass permissions on (shift+tab to cycle) \u00b7 5 files +322 -66'
  const h = Math.floor(elapsed / 3600000)
  const m = Math.floor((elapsed % 3600000) / 60000)
  s.infoText.text = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} | tip: /git:commit`
}

export function tickDemo(
  now: number,
  ts: TickerState,
  s: SceneRefs,
  params: Params,
  lctx: LayoutCtx,
): void {
  if (ts.verbs.length > 0 && now - ts.lastVerbTime >= params.verbMs) {
    const nextIdx = (ts.verbIdx + 1) % ts.verbs.length
    if (nextIdx === 0 && ts.verbs.length > 1) {
      ts.verbs = shuffle(ts.verbs)
    }
    ts.verbIdx = nextIdx
    s.verbText.text = ts.verbs[ts.verbIdx]
    ts.lastVerbTime = now
    ts.layoutDirty = true
  }
  if (now - ts.lastTokenTime >= 1000) {
    ts.tokenCount += params.tokenRate + Math.floor(Math.random() * 20 - 10)
    ts.lastTokenTime = now
  }
  tickHighlight(now, s, params, lctx)
  s.metaText.text = `(esc to interrupt \u00b7 ${fmtElapsed(now - ts.startTime)} \u00b7 \u2193 ${ts.tokenCount} tokens \u00b7 thinking)`
}

function tickHighlight(now: number, s: SceneRefs, params: Params, lctx: LayoutCtx): void {
  const verb = s.verbText.text
  if (verb.length === 0) return
  const cycleMs = (verb.length + 2) * params.charDwellMs
  const step = Math.floor((now % cycleMs) / params.charDwellMs) - 2
  const start = Math.max(0, step)
  const end = Math.min(verb.length, step + 3)
  s.highlightText.text = verb.substring(start, end)
  s.highlightText.x = s.verbText.x + start * lctx.chW
  s.highlightText.visible = end > start
}

export function tickLayout(
  ts: TickerState,
  s: SceneRefs,
  params: Params,
  machine: Machine,
  lctx: LayoutCtx,
  scrollItems: (Text | Container)[],
  pool: TextPool,
): void {
  if (!ts.layoutDirty) return
  layout(s.contentW, s.contentH, params, machine, lctx, { ...s, scrollItems }, pool)
  ts.layoutDirty = false
}

export function tickFlicker(
  s: SceneRefs,
  machine: Machine,
  params: Params,
  flicker: FlickerState,
  lctx: LayoutCtx,
): void {
  if (machine.current === State.BUGGED) {
    applyFlicker(s.tuiContainer, params, flicker, lctx.lineHeight)
    s.tuiContainer.y += s.padY
  } else {
    s.tuiContainer.y = s.padY
    s.tuiContainer.alpha = 1
  }
}
