import type { VerbSet, VerbSets } from '$lib/data/types'
import * as TWEEN from '@tweenjs/tween.js'
import { Application, type Container, Text } from 'pixi.js'
import {
  applyStateEntry,
  exitCurrentState,
  handleResize,
  initHeader,
  removeIntroRows,
  resetDemoState,
  updateSuggestionUI,
} from './app-helpers'
import { type BootAnim, createBootAnim, destroyBootAnim, runBootAnim } from './boot'
import { applyCamera } from './camera'
import { FONT_FAMILY, LAYOUT, MOUSE_DEFAULTS, PALETTE } from './constants'
import { createFlickerState } from './effects/flicker'
import type { LineDef } from './events'
import { createLineBuffer } from './events'
import { hexToNum, shuffle } from './helpers'
import { createLayoutCtx } from './layout'
import { createParams, displaySize } from './params'
import { buildScene } from './scene'
import { createScrollZoomController } from './scroll-zoom'
import { type DispatchEvent, State, createMachine, dispatch } from './state-machine'
import { createTextPool } from './text-pool'
import {
  createTickerState,
  tickDemo,
  tickFlicker,
  tickLayout,
  tickScroll,
  tickSpinner,
} from './ticker'
import { createZoomController } from './zoom'

function updateContainerFontSize(items: (Text | Container)[], fontSize: number): void {
  for (const item of items)
    if ('children' in item)
      for (const child of (item as Container).children)
        if ('style' in child) (child as Text).style.fontSize = fontSize
}

function detectLocale(sets: VerbSets): string {
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
  onMarketplace?: () => void
}

export interface AppHandle {
  cleanup: () => void
  disableScrollZoom: () => void
}

export async function createApp(
  wrap: HTMLDivElement,
  sets: VerbSets,
  options?: AppOptions,
): Promise<AppHandle> {
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
  const pool = createTextPool(params)
  const machine = createMachine()
  const flicker = createFlickerState()
  const lctx = createLayoutCtx(s.chW, params.fontSize, params.lineHeightOffset)
  const ts = createTickerState()

  const locale = detectLocale(sets)
  const idiotSet = findIdiotSet(sets)
  const localeSets = buildLocaleSets(sets, locale, idiotSet)

  const lineBuffer: LineDef[] = []
  const bufState = createLineBuffer()
  const scrollItems: (Text | Container)[] = []
  const bootAnim: BootAnim = createBootAnim()

  const doDispatch = (event: DispatchEvent) =>
    dispatch(event, machine, localeSets, idiotSet, {
      enterState,
      updateSuggestion,
      onMarketplace: options?.onMarketplace,
    })

  const updateCamera = () =>
    applyCamera(
      app.screen.width,
      app.screen.height,
      params,
      s.cameraMeshBaseVerts,
      s.cameraMeshVerts,
      () => s.cameraMesh.geometry.getBuffer('aPosition').update(),
    )

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

  function enterState(state: State): void {
    if (machine.current === State.BOOT) {
      destroyBootAnim(bootAnim)
      removeIntroRows(introCount, s, scrollItems, ts)
    }
    exitCurrentState(machine)
    machine.previous = machine.current
    machine.current = state
    if (state === State.POST_DEMO) machine.postIndex = 0
    if (state === State.BUGGED) flicker.mode = 0
    if (state === State.BOOT) {
      runBootAnim(bootAnim, params.frameMs, {
        setPrompt: (t) => {
          s.caretText.text = t
          s.caretText.style.fill = PALETTE.prompt
          s.inputText.x = Math.round(s.caretText.width)
        },
        setInput: (t) => {
          s.inputText.text = t
          s.inputText.style.fill = PALETTE.active
        },
        onDone: () => enterState(State.IDLE),
      })
    } else {
      applyStateEntry(state, machine, updateSuggestion, startDemo)
    }
    zoomCtrl.applyJumpcut(state)
    ts.layoutDirty = true
  }

  syncResolution()
  updateCamera()

  // Scale animation removed - using zoom system instead
  // new TWEEN.Tween({ scale: params.scale })
  //   .to({ scale: 0.5 }, 15000)
  //   .easing(TWEEN.Easing.Cubic.Out)
  //   .onUpdate((obj) => {
  //     params.scale = obj.scale
  //     updateCamera()
  //   })
  //   .start()

  const zoomCtrl = createZoomController(params, updateCamera, s, app.screen.height)
  const scrollZoomCtrl = createScrollZoomController(s.scrollZoomWrap, app.canvas)

  // Mouse-driven camera offsets (composited on top of tweened params in `camera.ts`)
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
    // Map cursor to subtle translate offsets (±0.6% of screen)
    mouseState.targetTX = (mouseState.x - 0.5) * -MOUSE_DEFAULTS.translateRange
    mouseState.targetTY = (mouseState.y - 0.5) * -MOUSE_DEFAULTS.translateRange
    // Map cursor to subtle zoom factor
    const dist = Math.hypot(mouseState.x - 0.5, mouseState.y - 0.5)
    mouseState.targetZoom = 1 - dist * MOUSE_DEFAULTS.zoomFactor
  }
  window.addEventListener('mousemove', onMouseMove)

  const onResize = () => {
    syncResolution()
    handleResize(app, s, params, updateCamera)
    ts.layoutDirty = true
  }
  window.addEventListener('resize', onResize)

  app.ticker.add(() => {
    const now = Date.now()
    // Tweens default to `performance.now()`; passing `Date.now()` causes them to jump/finish instantly.
    TWEEN.update()

    // Smooth interpolation for mouse-driven camera (lerp factor 0.05 = subtle delay)
    const lerpFactor = MOUSE_DEFAULTS.lerpFactor
    mouseState.currentTX += (mouseState.targetTX - mouseState.currentTX) * lerpFactor
    mouseState.currentTY += (mouseState.targetTY - mouseState.currentTY) * lerpFactor
    mouseState.currentZoom += (mouseState.targetZoom - mouseState.currentZoom) * lerpFactor

    // Apply smoothed values to params
    params.mouseTranslateX = mouseState.currentTX
    params.mouseTranslateY = mouseState.currentTY
    params.mouseZoom = mouseState.currentZoom
    updateCamera()

    tickSpinner(now, ts, s, params)
    tickScroll(now, ts, s, machine, params, lineBuffer, bufState, scrollItems, pool, lctx)
    if (
      machine.current === State.DEMO ||
      machine.current === State.POST_DEMO ||
      machine.current === State.BUGGED
    )
      tickDemo(now, ts, s, params, lctx)
    tickLayout(ts, s, params, machine, lctx, scrollItems, pool)
    tickFlicker(s, machine, params, flicker, lctx)
    s.display.renderable = true
    app.renderer.render({ container: s.display, target: s.displayRT })
    s.display.renderable = false
  })

  const onKeyDown = (e: KeyboardEvent) => {
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
    } else if (e.key === '`') toggleDevtools()
  }
  document.addEventListener('keydown', onKeyDown)

  s.inputContainer.on('pointertap', () => doDispatch('ENTER'))
  s.promptText.eventMode = 'static'
  s.promptText.cursor = 'pointer'
  s.promptText.on('pointertap', () => {
    if (machine.current === State.IDLE) doDispatch('ENTER')
  })

  const introCount = initHeader(sets, params, s, lctx, scrollItems)
  enterState(State.BOOT)

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
    s.glareSprite.alpha = params.glareOpacity
    s.lcdFilter.enabled = params.lcdEnabled
    s.bloomFilter.enabled = params.bloomEnabled
    s.bloomFilter.strengthX = params.bloomStrength
    s.bloomFilter.strengthY = params.bloomStrength
    s.adjustmentFilter.brightness = params.brightness * params.exposure
    s.adjustmentFilter.saturation = params.saturation
    s.deadPixelSprite.visible = params.deadPixelsEnabled
    s.stuckPixelSprite.visible = params.deadPixelsEnabled
    s.verbText.style.fill = hexToNum(params.colorVerb)
    s.ellipsisText.style.fill = hexToNum(params.colorEllipsis)
    s.metaText.style.fill = PALETTE.suggestion
    s.highlightText.style.fill = hexToNum(params.colorHighlight)
    syncResolution()
    syncFontSize()
    app.canvas.style.imageRendering = params.imageRendering
    ts.layoutDirty = true
  }

  function syncFontSize(): void {
    const texts = [
      s.glyphText,
      s.verbText,
      s.ellipsisText,
      s.highlightText,
      s.metaText,
      s.caretText,
      s.inputText,
      s.ruleTop,
      s.promptText,
      s.ruleBottom,
      s.statusText,
      s.permsText,
      s.infoText,
    ]
    for (const t of texts) t.style.fontSize = params.fontSize
    updateContainerFontSize(scrollItems, params.fontSize)
    const m = new Text({
      text: 'M',
      style: { fontFamily: FONT_FAMILY, fontSize: params.fontSize },
    })
    lctx.chW = m.width
    const baseLineHeight = Math.round(params.fontSize * LAYOUT.lineHeightRatio)
    lctx.lineHeight = baseLineHeight + params.lineHeightOffset
    m.destroy()
  }

  function syncResolution(): void {
    const [dW, dH] = displaySize(app.screen.width, app.screen.height, params.displayDownscale)
    const padX = Math.round(dW * params.screenPadding)
    const padY = Math.round(dH * params.screenPadding)
    const padDW = dW + 2 * padX
    const padDH = dH + 2 * padY
    s.displayRT.resize(padDW, padDH)
    s.bgContainer.clear()
    s.bgContainer.rect(0, 0, padDW, padDH)
    s.bgContainer.fill(hexToNum(params.bgColor))
    s.tuiContainer.x = padX
    s.tuiContainer.y = padY
    s.contentW = dW
    s.contentH = dH
    s.padY = padY
    s.lcdFilter.enabled = params.lcdEnabled
  }

  let devtoolsLoaded = false
  async function toggleDevtools() {
    if (devtoolsLoaded) return
    devtoolsLoaded = true
    const { initDevtools } = await import('./devtools')
    initDevtools(params, syncParamsToScene)
  }

  if (location.hostname === 'localhost') toggleDevtools()

  return {
    cleanup: () => {
      destroyed = true
      destroyBootAnim(bootAnim)
      scrollZoomCtrl.cleanup()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('keydown', onKeyDown)
      if (machine.demoTimer) clearTimeout(machine.demoTimer)
      pool.flush()
      app.destroy(true, { children: true })
      // biome-ignore lint/suspicious/noExplicitAny: cleanup window globals
      ;(window as any).__spinnerAPI = undefined
      // biome-ignore lint/suspicious/noExplicitAny: cleanup window globals
      ;(window as any).__PIXI_DEVTOOLS__ = undefined
    },
    disableScrollZoom: () => scrollZoomCtrl.cleanup(),
  }
}
