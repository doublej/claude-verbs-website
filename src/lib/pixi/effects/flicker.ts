import type { Container } from 'pixi.js'
import { randInt } from '../helpers'
import type { Params } from '../params'

export interface FlickerState {
  mode: number
}

export function createFlickerState(): FlickerState {
  return { mode: 0 }
}

interface FlickerResult {
  yOff: number
  alpha: number
}

function chaosFlicker(flickLh: number, params: Params): FlickerResult {
  const ctx = randInt(0, 3)
  const sign = Math.random() < 0.5 ? -1 : 1
  if (ctx === 0)
    return { yOff: flickLh * sign * params.flickerMaxYLines, alpha: 0.7 + Math.random() * 0.3 }
  if (ctx === 1)
    return { yOff: flickLh * sign, alpha: params.flickerGhostAlphaMin + Math.random() * 0.3 }
  if (ctx === 2) return { yOff: 0, alpha: 0 }
  return { yOff: flickLh * (Math.random() - 0.5) * 2, alpha: 0.5 + Math.random() * 0.5 }
}

function pickFlickerMode(params: Params): number {
  const r = Math.random() * 100
  const np = params.flickerNormalPct
  const band = (100 - np) / 3
  if (r < np) return 0
  if (r < np + band) return 1
  if (r < np + band * 2) return 2
  return 3
}

function randomFlicker(flickLh: number, params: Params, state: FlickerState): FlickerResult {
  state.mode = pickFlickerMode(params)
  const chaos = state.mode > 0 && Math.random() < 0.1
  let yOff = 0
  if (state.mode === 1 || chaos)
    yOff = flickLh * (Math.random() < 0.5 ? -1 : 1) * randInt(1, params.flickerMaxYLines)

  const alpha =
    state.mode === 2
      ? 0
      : state.mode === 3
        ? params.flickerGhostAlphaMin + Math.random() * (1 - params.flickerGhostAlphaMin) * 0.6
        : 1
  return { yOff, alpha }
}

export function applyFlicker(
  wrap: Container,
  params: Params,
  state: FlickerState,
  lineHeight: number,
): void {
  const flickLh = lineHeight
  const result =
    Math.random() < 0.6 ? chaosFlicker(flickLh, params) : randomFlicker(flickLh, params, state)
  wrap.y = result.yOff
  wrap.alpha = result.alpha
}
