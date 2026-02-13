import type { VerbSet, VerbSets } from '$lib/data/types'
import { Application, type Container, type Text } from 'pixi.js'
import {
  addHeaderRows,
  applyStateEntry,
  exitCurrentState,
  handleResize,
  resetDemoState,
  syncFontSize,
  syncResolution,
  updateSuggestionUI,
} from './app-helpers'
import { type BootAnim, createBootAnim, destroyBootAnim, runBootAnim } from './boot'
import {
  type BrightnessBar,
  adjustBrightness,
  createBrightnessBar,
  startDimAnimation,
  tickBrightnessBar,
} from './brightness-bar'
import { applyCamera } from './camera'
import { MOUSE_DEFAULTS, PALETTE, refreshPalette } from './constants'
import { createFocusCrosshair, updateFocusCrosshair } from './debug-focus'
import { createBreathingState, tickBreathing } from './effects/breathing'
import { updateDofUniforms } from './effects/dof'
import { createFlickerState } from './effects/flicker'
import { type EscSkip, createEscSkip, escKeyDown, escKeyUp, resetEsc, tickEsc } from './esc-skip'
import type { LineDef } from './events'
import { createLineBuffer } from './events'
import { countColumns, hexToNum, shuffle } from './helpers'
import { createLayoutCtx } from './layout'
import { initMobileDemo } from './mobile'
import { createParams, displaySize } from './params'
import { buildScene } from './scene'
import { createScrollZoomController } from './scroll-zoom'
import {
  BUGGED_TIMEOUT_MS,
  type DispatchEvent,
  State,
  createMachine,
  dispatch,
} from './state-machine'
import { createTextPool } from './text-pool'
import {
  createTickerState,
  tickClock,
  tickDemo,
  tickFlicker,
  tickLayout,
  tickScroll,
  tickSpinner,
} from './ticker'
import { tweenGroup } from './tween-group'
import { createZoomController } from './zoom'

function resolveLocale(sets: VerbSets, preferredLang?: string): string {
  if (preferredLang && sets[preferredLang]) return preferredLang
  const lang = (navigator.language || 'en').slice(0, 2).toLowerCase()
  if (sets[lang]) return lang
  return sets.en ? 'en' : Object.keys(sets)[0] || 'en'
}

function findIdiotSet(sets: VerbSets): VerbSet | null {
  if (!sets.en) return null
  return sets.en.find((s) => s.name === 'idiot' || s.name === 'an idiot') ?? null
}

function collectExtraSets(sets: VerbSets, exclude: VerbSet[], idiotSet: VerbSet | null): VerbSet[] {
  const pool: VerbSet[] = []
  for (const k of Object.keys(sets))
    for (const s of sets[k]) if (s !== idiotSet && !exclude.includes(s)) pool.push(s)
  return shuffle(pool)
}

function buildLocaleSets(sets: VerbSets, locale: string, idiotSet: VerbSet | null): VerbSet[] {
  const list = (sets[locale] || []).slice()
  if (list[0] === idiotSet && list.length > 1) list.push(list.shift() as VerbSet)
  else if (list[0] === idiotSet) list.length = 0

  if (list.length < 3) {
    const pool = collectExtraSets(sets, list, idiotSet)
    while (list.length < 3 && pool.length > 0) list.push(pool.shift() as VerbSet)
  }
  return list
}

const KEY_MAP: Record<string, DispatchEvent> = {
  Enter: 'ENTER',
  ArrowDown: 'ARROW_DOWN',
  ArrowUp: 'ARROW_UP',
  Escape: 'ESC',
}

interface AppOptions {
  demoMode?: boolean
  onMarketplace?: () => void
  onEscSkipActivated?: () => void
  onEscSkipProgress?: (progress: number) => void
  preferredLang?: string
}

export interface AppHandle {
  cleanup: () => void
  disableScrollZoom: () => void
  enableScrollZoom: () => void
  restartExperience: () => void
  setOverlapped: (v: boolean) => void
  skipToMarketplace: () => void
}

export async function createApp(
  wrap: HTMLDivElement,
  sets: VerbSets,
  options?: AppOptions,
): Promise<AppHandle> {
  refreshPalette()
  const demoMode = options?.demoMode ?? false
  const params = createParams()

  const app = new Application()
  await app.init({
    resizeTo: wrap,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: hexToNum(params.bgColor),
    antialias: false,
    roundPixels: true,
  })
  wrap.appendChild(app.canvas)

  const [initDW, initDH] = displaySize(app.screen.width, app.screen.height, params.displayDownscale)
  const s = buildScene(app, params, initDW, initDH)
  const focusCrosshair = createFocusCrosshair(s.tuiContainer)
  const pool = createTextPool(params)
  const machine = createMachine()
  const flicker = createFlickerState()
  const breathing = createBreathingState()
  const lctx = createLayoutCtx(s.chW, params.fontSize, params.lineHeightOffset)
  const ts = createTickerState()

  const locale = resolveLocale(sets, options?.preferredLang)
  const idiotSet = findIdiotSet(sets)
  const localeSets = buildLocaleSets(sets, locale, idiotSet)

  const lineBuffer: LineDef[] = []
  const bufState = createLineBuffer()
  const scrollItems: (Text | Container)[] = []
  const bootAnim: BootAnim = createBootAnim()
  const escSkip: EscSkip = createEscSkip(params.fontSize, s.chW, s.contentW, s.contentH)
  s.tuiContainer.addChild(escSkip.popup)

  const brightnessBar = createBrightnessBar(params.fontSize, s.chW, s.contentH)
  brightnessBar.container.x = -(s.chW * 2 + brightnessBar.track.width)
  brightnessBar.container.y = Math.round(s.contentH * 0.2)
  s.tuiContainer.addChild(brightnessBar.container)

  const doDispatch = (event: DispatchEvent) =>
    dispatch(event, machine, localeSets, idiotSet, {
      enterState,
      updateSuggestion,
      onMarketplace: options?.onMarketplace,
    })

  const flushCamera = () =>
    applyCamera(
      app.screen.width,
      app.screen.height,
      params,
      s.cameraMeshBaseVerts,
      s.cameraMeshVerts,
      () => s.cameraMesh.geometry.getBuffer('aPosition').update(),
    )

  const updateCamera = () => {
    cameraDirty = true
  }

  function updateSuggestion(): void {
    updateSuggestionUI(machine, localeSets, idiotSet, s, ts)
  }

  function startDemo(set: VerbSet | null): void {
    if (!set) return
    machine.hasSubmitted = true
    machine.activeSet = set
    resetDemoState(set, ts, s, params, scrollItems, pool)
    machine.demoTimer = setTimeout(() => doDispatch('DEMO_TIMEOUT'), params.demoTimeoutMs)
  }

  function clearBootTexts(): void {
    s.caretText.text = ''
    s.inputText.text = ''
    s.bootOutputText.text = ''
    s.bootHintText.text = ''
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: multi-state entry dispatch
  function enterState(state: State): void {
    if (machine.current === State.INTRO || machine.current === State.INTRO_READY) {
      destroyBootAnim(bootAnim)
      resetEsc(escSkip)
      if (state !== State.INTRO_READY) {
        clearBootTexts()
        if (!headerAdded) {
          addHeaderRows(sets, params, s, lctx, scrollItems)
          headerAdded = true
        }
      }
    }
    exitCurrentState(machine)
    machine.previous = machine.current
    machine.current = state
    if (state === State.POST_DEMO) {
      machine.postIndex = 0
      if (brightnessBar)
        startDimAnimation(brightnessBar, 7, 120, (mult) => {
          params.userBrightness = mult
          syncParamsToScene()
        })
    }
    if (state === State.BUGGED) {
      flicker.mode = 0
      machine.buggedTimer = setTimeout(() => doDispatch('BUGGED_TIMEOUT'), BUGGED_TIMEOUT_MS)
    }
    if (state === State.INTRO) {
      runBootAnim(bootAnim, params.frameMs, {
        setPrompt: (t) => {
          s.caretText.text = t
          s.caretText.style.fill = PALETTE.prompt
          s.inputText.x = Math.round(countColumns(s.caretText.text) * lctx.chW)
        },
        setInput: (t) => {
          s.inputText.text = t
          s.inputText.style.fill = PALETTE.active
        },
        setOutput: (t) => {
          s.bootOutputText.text = t
          ts.layoutDirty = true
        },
        setHint: (t) => {
          s.bootHintText.text = t
        },
        onReady: () => enterState(State.INTRO_READY),
      })
    } else {
      applyStateEntry(state, machine, updateSuggestion, startDemo)
    }
    zoomCtrl.applyJumpcut(state)
    ts.layoutDirty = true
    ts.statusDirty = true
  }

  syncResolution(app, s, params)
  flushCamera()

  const zoomCtrl = createZoomController(
    params,
    updateCamera,
    syncParamsToScene,
    s,
    lctx,
    app.screen.height,
  )
  const scrollZoomCtrl = createScrollZoomController(s.scrollZoomWrap, app.canvas)

  let cameraDirty = true

  const mouseState = {
    x: 0.5,
    y: 0.5,
    targetTX: 0,
    targetTY: 0,
    targetZoom: 1,
    currentTX: 0,
    currentTY: 0,
    currentZoom: 1,
  }

  const onMouseMove = (e: MouseEvent) => {
    const rect = app.canvas.getBoundingClientRect()
    mouseState.x = (e.clientX - rect.left) / rect.width
    mouseState.y = (e.clientY - rect.top) / rect.height
    mouseState.targetTX = (mouseState.x - 0.5) * -MOUSE_DEFAULTS.translateRange
    mouseState.targetTY = (mouseState.y - 0.5) * -MOUSE_DEFAULTS.translateRange
    const dist = Math.hypot(mouseState.x - 0.5, mouseState.y - 0.5)
    mouseState.targetZoom = 1 - dist * MOUSE_DEFAULTS.zoomFactor
  }
  window.addEventListener('mousemove', onMouseMove)

  const onResize = () => {
    syncResolution(app, s, params)
    handleResize(app, s, params, updateCamera)
    ts.layoutDirty = true
  }
  window.addEventListener('resize', onResize)

  app.ticker.add(() => {
    const now = Date.now()
    // Tweens default to `performance.now()`; passing `Date.now()` causes them to jump/finish instantly.
    tweenGroup.update()

    const lerpFactor = MOUSE_DEFAULTS.lerpFactor
    mouseState.currentTX += (mouseState.targetTX - mouseState.currentTX) * lerpFactor
    mouseState.currentTY += (mouseState.targetTY - mouseState.currentTY) * lerpFactor
    mouseState.currentZoom += (mouseState.targetZoom - mouseState.currentZoom) * lerpFactor
    params.mouseTranslateX = mouseState.currentTX
    params.mouseTranslateY = mouseState.currentTY
    params.mouseZoom = mouseState.currentZoom
    cameraDirty = true
    if (cameraDirty) {
      flushCamera()
      cameraDirty = false
    }

    tickSpinner(now, ts, s, params)
    tickClock(now, ts, s)
    tickScroll(now, ts, s, machine, params, lineBuffer, bufState, scrollItems, pool, lctx)
    if (
      machine.current === State.DEMO ||
      machine.current === State.POST_DEMO ||
      machine.current === State.BUGGED ||
      machine.current === State.ESC_COUNTDOWN
    )
      tickDemo(now, ts, s, params, lctx)
    tickLayout(ts, s, params, machine, lctx, scrollItems, pool)
    tickFlicker(s, machine, params, flicker, lctx)
    tickBreathing(breathing, s.breathingWrap, now, app.screen.width, app.screen.height)
    if (brightnessBar) tickBrightnessBar(brightnessBar)
    const escTick = tickEsc(escSkip)
    if (escTick.justActivated) {
      options?.onEscSkipActivated?.()
      if (machine.current !== State.ESC_COUNTDOWN) enterState(State.ESC_COUNTDOWN)
    }
    if (escSkip.activated) {
      options?.onEscSkipProgress?.(escTick.progress)
      if (escTick.progress >= 1) {
        resetEsc(escSkip)
        enterState(State.POST_DEMO)
        options?.onMarketplace?.()
      }
    }

    const dofTarget = machine.overlapped ? 1 : 0
    const dofDelta = dofTarget - s.dofFilter._strength
    if (Math.abs(dofDelta) > 0.001) {
      s.dofFilter._strength += dofDelta * 0.04
      s.dofFilter.enabled = s.dofFilter._strength > 0.01
      updateDofUniforms(s.dofFilter)
    } else if (s.dofFilter._strength !== dofTarget) {
      s.dofFilter._strength = dofTarget
      s.dofFilter.enabled = dofTarget > 0
      updateDofUniforms(s.dofFilter)
    }

    updateFocusCrosshair(focusCrosshair, params)
    s.display.renderable = true
    app.renderer.render({ container: s.display, target: s.displayRT })
    s.display.renderable = false
  })

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      const justActivated = escKeyDown(escSkip, e.repeat)
      if (justActivated) options?.onEscSkipActivated?.()
      if (!escSkip.activated) {
        const mapped = KEY_MAP[e.key]
        if (mapped) doDispatch(mapped)
      }
      return
    }
    const mapped = KEY_MAP[e.key]
    if (mapped) {
      e.preventDefault()
      doDispatch(mapped)
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      doDispatch('SHIFT_TAB')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      doDispatch('TAB')
    } else if ((e.key === '+' || e.key === '=') && brightnessBar) {
      params.userBrightness = adjustBrightness(brightnessBar, 1)
      syncParamsToScene()
    } else if ((e.key === '-' || e.key === '_') && brightnessBar) {
      params.userBrightness = adjustBrightness(brightnessBar, -1)
      syncParamsToScene()
    } else if (e.key === '`') toggleDevtools()
  }
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      escKeyUp(escSkip)
      options?.onEscSkipProgress?.(0)
      if (machine.current === State.ESC_COUNTDOWN) enterState(machine.previous)
    }
  }
  if (!demoMode) {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
  }

  if (!demoMode) {
    s.inputContainer.on('pointertap', () => doDispatch('ENTER'))
    s.promptText.eventMode = 'static'
    s.promptText.cursor = 'pointer'
    s.promptText.on('pointertap', () => {
      if (machine.current === State.IDLE) doDispatch('ENTER')
    })
  }

  let headerAdded = false
  let demoCleanup: (() => void) | null = null
  if (demoMode) {
    // Shift focus area to the left on mobile to prevent content from being off-screen
    params.absoluteX = 2
    // Scale back the scene on mobile to fit better
    params.scale = 0.85
    demoCleanup = initMobileDemo({
      machine,
      localeSets,
      ts,
      s,
      params,
      lctx,
      scrollItems,
      pool,
      brightnessBar,
      syncParamsToScene,
      canvas: app.canvas,
    })
  } else {
    enterState(State.INTRO)
  }
  // biome-ignore lint/suspicious/noExplicitAny: window augmentation for devtools
  ;(window as any).__spinnerAPI = {
    app,
    params,
    applyParam: syncParamsToScene,
  }
  // biome-ignore lint/suspicious/noExplicitAny: window augmentation for PIXI devtools
  ;(window as any).__PIXI_DEVTOOLS__ = { app }

  let destroyed = false

  function syncParamsToScene(): void {
    if (destroyed) return
    updateCamera()
    s.lcdFilter.enabled = params.lcdEnabled
    s.bloomFilter.enabled = params.bloomEnabled
    s.bloomFilter.strengthX = params.bloomStrength * params.userBrightness
    s.bloomFilter.strengthY = params.bloomStrength * params.userBrightness
    s.adjustmentFilter.brightness = params.brightness * params.exposure * params.userBrightness
    s.adjustmentFilter.saturation = params.saturation
    s.deadPixelSprite.visible = params.deadPixelsEnabled
    s.stuckPixelSprite.visible = params.deadPixelsEnabled
    s.verbText.style.fill = hexToNum(params.colorVerbHighlight)
    s.ellipsisText.style.fill = hexToNum(params.colorEllipsis)
    s.metaText.style.fill = PALETTE.suggestion
    s.highlightText.style.fill = hexToNum(params.colorHighlight)
    syncResolution(app, s, params)
    syncFontSize(params, lctx, s, scrollItems)
    app.canvas.style.imageRendering = params.imageRendering
    ts.layoutDirty = true
  }

  let devtoolsLoaded = false
  async function toggleDevtools() {
    if (devtoolsLoaded) return
    devtoolsLoaded = true
    const { initDevtools } = await import('./devtools')
    initDevtools(params, s.dofFilter, syncParamsToScene, focusCrosshair)
  }

  if (location.hostname === 'localhost') toggleDevtools()

  function restartExperience(): void {
    if (demoMode) return
    destroyBootAnim(bootAnim)
    resetEsc(escSkip)
    machine.current = State.IDLE
    machine.previous = State.IDLE
    machine.activeSet = null
    machine.browseIndex = 0
    machine.skipCount = 0
    machine.postIndex = 0
    machine.hasSubmitted = false
    machine.tabCompleted = false
    if (machine.demoTimer) {
      clearTimeout(machine.demoTimer)
      machine.demoTimer = null
    }
    if (machine.buggedTimer) {
      clearTimeout(machine.buggedTimer)
      machine.buggedTimer = null
    }
    machine.overlapped = false
    scrollZoomCtrl.enable()
    enterState(State.INTRO)
  }

  return {
    cleanup: () => {
      destroyed = true
      destroyBootAnim(bootAnim)
      resetEsc(escSkip)
      scrollZoomCtrl.cleanup()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      if (!demoMode) {
        document.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('keyup', onKeyUp)
      }
      demoCleanup?.()
      if (machine.demoTimer) clearTimeout(machine.demoTimer)
      if (machine.buggedTimer) clearTimeout(machine.buggedTimer)
      pool.flush()
      app.destroy(true, { children: true })
      // biome-ignore lint/suspicious/noExplicitAny: cleanup window globals
      ;(window as any).__spinnerAPI = undefined
      // biome-ignore lint/suspicious/noExplicitAny: cleanup window globals
      ;(window as any).__PIXI_DEVTOOLS__ = undefined
    },
    disableScrollZoom: () => scrollZoomCtrl.disable(),
    enableScrollZoom: () => scrollZoomCtrl.enable(),
    restartExperience,
    setOverlapped: (v: boolean) => {
      machine.overlapped = v
    },
    skipToMarketplace: () => {
      resetEsc(escSkip)
      enterState(State.POST_DEMO)
      options?.onMarketplace?.()
    },
  }
}
