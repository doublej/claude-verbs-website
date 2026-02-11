import * as TWEEN from '@tweenjs/tween.js'
import type { Params } from './params'
import type { SceneRefs } from './scene'
import { State } from './state-machine'

export interface ZoomTarget {
  zoom: number
  focusY: number | 'header' | 'spinner' | 'prompt' | 'center'
  duration?: number
}

export interface ZoomController {
  applyJumpcut: (state: State) => void
}

export const ZOOM_TARGETS: Record<State, ZoomTarget> = {
  [State.BOOT]: { zoom: 1.6, focusY: 'center', duration: 200 },
  [State.IDLE]: { zoom: 1.0, focusY: 'prompt', duration: 300 },
  [State.BROWSING]: { zoom: 1.35, focusY: 'prompt', duration: 180 },
  [State.DEMO]: { zoom: 0.8, focusY: 'spinner', duration: 250 },
  [State.POST_DEMO]: { zoom: 1.15, focusY: 'prompt', duration: 200 },
  [State.BUGGED]: { zoom: 0.65, focusY: 'center', duration: 100 },
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
): TWEEN.Tween<{ zoom: number }> {
  return new TWEEN.Tween({ zoom: params.zoom })
    .to({ zoom: targetZoom }, duration)
    .easing(TWEEN.Easing.Cubic.InOut)
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
): TWEEN.Tween<{ strength: number }> {
  return new TWEEN.Tween({ strength: params.focusStrength })
    .to({ strength: 0.6 }, duration)
    .easing(TWEEN.Easing.Cubic.InOut)
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
): TWEEN.Tween<{ zoom: number }> {
  return new TWEEN.Tween({ zoom: params.zoom })
    .to({ zoom: targetZoom }, durationMs)
    .easing(TWEEN.Easing.Cubic.Out)
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
  let currentZoomTween: TWEEN.Tween<{ zoom: number }> | null = null
  let currentFocusTween: TWEEN.Tween<{ strength: number }> | null = null
  let baseTimeline = createBaseTimeline(params, 0.75, 25000, updateCamera)

  const stopAllTweens = () => {
    baseTimeline.stop()
    currentZoomTween?.stop()
    currentFocusTween?.stop()
  }

  const startBaseTimeline = () => {
    baseTimeline = createBaseTimeline(params, 0.75, 25000, updateCamera)
    baseTimeline.start()
  }

  const applyJumpcut = (state: State) => {
    if (isInitialBoot && state === State.BOOT) {
      isInitialBoot = false
      return
    }
    isInitialBoot = false

    const target = ZOOM_TARGETS[state]
    if (!target) return

    stopAllTweens()

    const duration = target.duration ?? 150
    const focusY = resolveYPosition(target.focusY, s, screenH)

    currentZoomTween = createZoomTween(params, target.zoom, duration, updateCamera, () => {
      currentZoomTween = null
      startBaseTimeline()
    })

    if (focusY > 0) {
      currentFocusTween = createFocusTween(params, focusY, duration, updateCamera, () => {
        currentFocusTween = null
      })
    }
  }

  baseTimeline.start()
  return { applyJumpcut }
}
