import { Easing, Tween } from '@tweenjs/tween.js'
import { SEQUENCE } from './config'
import type { Params } from './params'
import type { SceneRefs } from './scene'
import { State } from './state-machine'
import { tweenGroup } from './tween-group'

export interface ZoomTarget {
  zoom: number
  focusY: number | 'header' | 'spinner' | 'prompt' | 'bootHint' | 'center'
  duration?: number
}

export interface ZoomController {
  applyJumpcut: (state: State) => void
}

const STATE_KEY: Record<State, keyof typeof SEQUENCE.zoom.states> = {
  [State.BOOT]: 'BOOT',
  [State.IDLE]: 'IDLE',
  [State.BROWSING]: 'BROWSING',
  [State.DEMO]: 'DEMO',
  [State.POST_DEMO]: 'POST_DEMO',
  [State.BUGGED]: 'BUGGED',
  [State.BOOT_READY]: 'BOOT_READY',
}

function resolveYPosition(focusY: number | string, s: SceneRefs, screenH: number): number {
  if (typeof focusY === 'number') return focusY

  switch (focusY) {
    case 'header':
      return s.scrollContainer.children[0]?.y ?? screenH * 0.3
    case 'spinner':
      return s.spinnerLine.y
    case 'prompt':
      return s.promptText.y
    case 'bootHint':
      return s.inputContainer.y + s.bootHintText.y + s.bootHintText.height / 2
    case 'center':
      return screenH / 2
    default:
      return 0
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

function createFocusTween(
  params: Params,
  focusY: number,
  duration: number,
  updateCamera: () => void,
  onComplete: () => void,
): Tween<{ strength: number }> {
  return new Tween({ strength: params.focusStrength }, tweenGroup)
    .to({ strength: SEQUENCE.zoom.focusStrength }, duration)
    .easing(Easing.Cubic.InOut)
    .onUpdate((obj) => {
      params.focusTargetY = focusY
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

export function createZoomController(
  params: Params,
  updateCamera: () => void,
  s: SceneRefs,
  screenH: number,
): ZoomController {
  let isInitialBoot = true
  let currentZoomTween: Tween<{ zoom: number }> | null = null
  let currentFocusTween: Tween<{ strength: number }> | null = null
  const { target, durationMs } = SEQUENCE.zoom.baseLine
  let baseTimeline = createBaseTimeline(params, target, durationMs, updateCamera)

  const stopAllTweens = () => {
    baseTimeline.stop()
    currentZoomTween?.stop()
    currentFocusTween?.stop()
  }

  const startBaseTimeline = () => {
    baseTimeline = createBaseTimeline(params, target, durationMs, updateCamera)
    baseTimeline.start()
  }

  const startCreepZoom = () => {
    const { creepTarget, creepDurationMs } = SEQUENCE.zoom.bootReadyCreep
    currentZoomTween = new Tween({ zoom: params.zoom }, tweenGroup)
      .to({ zoom: creepTarget }, creepDurationMs)
      .easing(Easing.Quadratic.In)
      .onUpdate((obj) => {
        params.zoom = obj.zoom
        updateCamera()
      })
      .onComplete(() => {
        currentZoomTween = null
      })
      .start()
  }

  const applyJumpcut = (state: State) => {
    if (isInitialBoot && state === State.BOOT) {
      isInitialBoot = false
      return
    }
    isInitialBoot = false

    const key = STATE_KEY[state]
    const cfg = key ? SEQUENCE.zoom.states[key] : null
    if (!cfg) return

    stopAllTweens()

    const dur = cfg.durationMs
    const focusY = resolveYPosition(cfg.focusY, s, screenH)

    const isBootReady = state === State.BOOT_READY
    currentZoomTween = createZoomTween(params, cfg.zoom, dur, updateCamera, () => {
      currentZoomTween = null
      if (isBootReady) startCreepZoom()
      else startBaseTimeline()
    })

    if (focusY > 0) {
      currentFocusTween = createFocusTween(params, focusY, dur, updateCamera, () => {
        currentFocusTween = null
      })
    }
  }

  baseTimeline.start()
  return { applyJumpcut }
}
