import { Easing, Tween } from '@tweenjs/tween.js'
import { type FocusTarget, SEQUENCE, type TweenableKey, TWEENABLE_KEYS, stateConfig } from './config'
import type { LayoutCtx } from './layout'
import type { Params } from './params'
import type { SceneRefs } from './scene'
import type { State } from './state-machine'
import { tweenGroup } from './tween-group'

export interface ZoomController {
  applyJumpcut: (state: State) => void
}

type EffectsState = Record<TweenableKey, number>

function readEffects(params: Params): EffectsState {
  return Object.fromEntries(TWEENABLE_KEYS.map((k) => [k, params[k]])) as EffectsState
}

function createEffectsTween(
  params: Params,
  targets: EffectsState,
  duration: number,
  syncScene: () => void,
  onComplete: () => void,
): Tween<EffectsState> {
  return new Tween(readEffects(params), tweenGroup)
    .to(targets, duration)
    .easing(Easing.Cubic.InOut)
    .onUpdate((obj) => {
      for (const k of TWEENABLE_KEYS) params[k] = obj[k]
      syncScene()
    })
    .onComplete(onComplete)
    .start()
}

function globalY(child: { getGlobalPosition: () => { y: number } }): number {
  return child.getGlobalPosition().y
}

interface FocusPosition {
  x: number
  y: number
}

function resolveFocusPosition(
  focus: FocusTarget,
  s: SceneRefs,
  lctx: LayoutCtx,
  screenH: number,
): FocusPosition {
  if (typeof focus === 'object') {
    return {
      x: (focus.char ?? 0) * lctx.chW,
      y: focus.line * lctx.lineHeight,
    }
  }
  switch (focus) {
    case 'header':
      return { x: 0, y: s.scrollContainer.children[0] ? globalY(s.scrollContainer.children[0]) : screenH * 0.3 }
    case 'spinner':
      return { x: 0, y: globalY(s.spinnerLine) }
    case 'prompt':
      return { x: 0, y: globalY(s.promptText) }
    case 'bootHint':
      return { x: 0, y: globalY(s.bootHintText) }
    case 'center':
      return { x: 0, y: screenH / 2 }
  }
}

function createZoomTween(
  params: Params,
  targetZoom: number,
  duration: number,
  updateCamera: () => void,
  onComplete: () => void,
): Tween<{ zoom: number }> {
  return new Tween({ zoom: params.zoom }, tweenGroup)
    .to({ zoom: targetZoom }, duration)
    .easing(Easing.Cubic.InOut)
    .onUpdate((obj) => {
      params.zoom = obj.zoom
      updateCamera()
    })
    .onComplete(onComplete)
    .start()
}

interface FocusTweenState {
  targetX: number
  targetY: number
  strength: number
}

function createFocusTween(
  params: Params,
  pos: FocusPosition,
  strength: number,
  duration: number,
  updateCamera: () => void,
  onComplete: () => void,
): Tween<FocusTweenState> {
  return new Tween(
    { targetX: params.focusTargetX, targetY: params.focusTargetY, strength: params.focusStrength },
    tweenGroup,
  )
    .to({ targetX: pos.x, targetY: pos.y, strength }, duration)
    .easing(Easing.Cubic.InOut)
    .onUpdate((obj) => {
      params.focusTargetX = obj.targetX
      params.focusTargetY = obj.targetY
      params.focusStrength = obj.strength
      updateCamera()
    })
    .onComplete(onComplete)
    .start()
}

function createBaseTimeline(
  params: Params,
  targetZoom: number,
  durationMs: number,
  updateCamera: () => void,
): Tween<{ zoom: number }> {
  return new Tween({ zoom: params.zoom }, tweenGroup)
    .to({ zoom: targetZoom }, durationMs)
    .easing(Easing.Cubic.Out)
    .onUpdate((obj) => {
      params.zoom = obj.zoom
      updateCamera()
    })
}

function effectTargets(cfg: ReturnType<typeof stateConfig>): EffectsState {
  return Object.fromEntries(TWEENABLE_KEYS.map((k) => [k, cfg[k]])) as EffectsState
}

export function createZoomController(
  params: Params,
  updateCamera: () => void,
  syncScene: () => void,
  s: SceneRefs,
  lctx: LayoutCtx,
  screenH: number,
): ZoomController {
  let currentZoomTween: Tween<{ zoom: number }> | null = null
  let currentEffectsTween: Tween<EffectsState> | null = null
  let currentFocusTween: Tween<FocusTweenState> | null = null
  const { target, durationMs } = SEQUENCE.zoom.baseLine
  let baseTimeline = createBaseTimeline(params, target, durationMs, updateCamera)

  const stopAllTweens = () => {
    baseTimeline.stop()
    currentZoomTween?.stop()
    currentEffectsTween?.stop()
    currentFocusTween?.stop()
  }

  const startBaseTimeline = () => {
    baseTimeline = createBaseTimeline(params, target, durationMs, updateCamera)
    baseTimeline.start()
  }

  const applyJumpcut = (state: State) => {
    const cfg = stateConfig(state)
    if (!cfg) return

    stopAllTweens()

    const dur = cfg.durationMs
    const pos = resolveFocusPosition(cfg.focusY, s, lctx, screenH)

    currentZoomTween = createZoomTween(params, cfg.zoom, dur, updateCamera, () => {
      currentZoomTween = null
      startBaseTimeline()
    })

    currentEffectsTween = createEffectsTween(params, effectTargets(cfg), dur, syncScene, () => {
      currentEffectsTween = null
    })

    if (pos.x > 0 || pos.y > 0) {
      currentFocusTween = createFocusTween(params, pos, cfg.focusStrength, dur, updateCamera, () => {
        currentFocusTween = null
      })
    }
  }

  baseTimeline.start()
  return { applyJumpcut }
}
