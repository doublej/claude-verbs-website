import { AdjustmentFilter } from 'pixi-filters/adjustment'
import { BloomFilter } from 'pixi-filters/bloom'
import {
  type Application,
  Container,
  type Filter,
  Graphics,
  MeshSimple,
  Rectangle,
  RenderTexture,
  Sprite,
  Text,
  Texture,
} from 'pixi.js'
import { createMeshGeometry } from './camera'
import { FONT_FAMILY, PALETTE } from './constants'
import { buildDeadPixelLayers } from './effects/dead-pixels'
import { buildGlareCanvas } from './effects/glare'
import { createLcdFilter } from './effects/lcd'
import { hexToNum, makeStyle } from './helpers'
import type { Params } from './params'

export interface SceneRefs {
  app: Application
  display: Container
  terminal: Container
  bgContainer: Graphics
  tuiContainer: Container
  scrollContainer: Container
  spinnerLine: Container
  metaLine: Container
  bottomChrome: Container
  inputContainer: Container
  overlayContainer: Container
  glyphText: Text
  verbText: Text
  ellipsisText: Text
  highlightText: Text
  metaText: Text
  caretText: Text
  inputText: Text
  bootOutputText: Text
  bootHintText: Text
  ruleTop: Text
  promptText: Text
  ruleBottom: Text
  statusText: Text
  permsText: Text
  infoText: Text
  lcdFilter: Filter
  bloomFilter: BloomFilter
  adjustmentFilter: AdjustmentFilter
  deadPixelSprite: Sprite
  stuckPixelSprite: Sprite
  glareSprite: Sprite
  breathingWrap: Container
  scrollZoomWrap: Container
  cameraMesh: MeshSimple
  cameraMeshBaseVerts: Float32Array
  cameraMeshVerts: Float32Array
  displayRT: RenderTexture
  contentW: number
  contentH: number
  padY: number
  chW: number
}

export function buildScene(app: Application, params: Params, dW: number, dH: number): SceneRefs {
  const screenW = app.screen.width
  const screenH = app.screen.height
  const padX = Math.round(dW * params.screenPadding)
  const padY = Math.round(dH * params.screenPadding)
  const padDW = dW + 2 * padX
  const padDH = dH + 2 * padY

  // Text objects
  const styleMain = makeStyle(hexToNum(params.colorVerbHighlight), params)
  const styleEllipsis = makeStyle(hexToNum(params.colorEllipsis), params)
  const styleMeta = makeStyle(PALETTE.suggestion, params)
  const styleHighlight = makeStyle(hexToNum(params.colorHighlight), params)

  const glyphText = new Text({ text: '\u2733', style: styleMain, label: 'glyph' })
  const verbText = new Text({ text: 'Loading', style: styleMain, label: 'verb' })
  const ellipsisText = new Text({ text: '\u2026', style: styleEllipsis, label: 'ellipsis' })
  const metaText = new Text({ text: '', style: styleMeta, label: 'meta' })
  const highlightText = new Text({ text: '', style: styleHighlight, label: 'highlight' })

  const spinnerLine = new Container({ label: 'spinnerLine' })
  spinnerLine.addChild(glyphText, verbText, ellipsisText, highlightText)

  const metaLine = new Container({ label: 'metaLine' })
  metaLine.addChild(metaText)

  // Input
  const inputContainer = new Container({ label: 'input' })
  inputContainer.eventMode = 'static'
  inputContainer.cursor = 'pointer'
  const caretText = new Text({
    text: '> ',
    style: makeStyle(PALETTE.suggestion, params),
    label: 'caret',
  })
  const inputText = new Text({
    text: '',
    style: makeStyle(PALETTE.suggestion, params),
    label: 'inputText',
  })
  inputText.x = Math.round(caretText.width)
  const bootOutputText = new Text({
    text: '',
    style: makeStyle(PALETTE.dim, params),
    label: 'bootOutput',
  })
  const bootHintText = new Text({
    text: '',
    style: makeStyle(PALETTE.prompt, params),
    label: 'bootHint',
  })
  inputContainer.addChild(caretText, inputText, bootOutputText, bootHintText)

  // Bottom chrome
  const ruleTop = new Text({ text: '', style: makeStyle(PALETTE.border, params), label: 'ruleTop' })
  const promptText = new Text({
    text: '\u276f',
    style: makeStyle(PALETTE.prompt, params),
    label: 'prompt',
  })
  const ruleBottom = new Text({
    text: '',
    style: makeStyle(PALETTE.border, params),
    label: 'ruleBottom',
  })
  const statusText = new Text({ text: '', style: makeStyle(PALETTE.dim, params), label: 'status' })
  const permsText = new Text({ text: '', style: makeStyle(PALETTE.warn, params), label: 'perms' })
  const infoText = new Text({ text: '', style: makeStyle(PALETTE.dim, params), label: 'info' })

  const bottomChrome = new Container({ label: 'bottomChrome' })
  bottomChrome.addChild(ruleTop, promptText, ruleBottom, statusText, permsText, infoText)

  const scrollContainer = new Container({ label: 'scroll' })
  const tuiContainer = new Container({ label: 'tuiContainer' })
  tuiContainer.addChild(scrollContainer, spinnerLine, metaLine, bottomChrome, inputContainer)

  // Terminal = bgContainer + tuiContainer
  const terminal = new Container({ label: 'terminal' })
  const bgContainer = new Graphics()
  bgContainer.rect(0, 0, padDW, padDH)
  bgContainer.fill(hexToNum(params.bgColor))
  tuiContainer.x = padX
  tuiContainer.y = padY
  terminal.addChild(bgContainer, tuiContainer)

  // Display container (rendered to displayRT, gets LCD + bloom + adjustment filters)
  const display = new Container({ label: 'display' })
  const lcdFilter = createLcdFilter()
  lcdFilter.enabled = params.lcdEnabled

  const bloomFilter = new BloomFilter({
    strength: params.bloomStrength,
    quality: params.bloomQuality,
  })
  bloomFilter.enabled = params.bloomEnabled

  const adjustmentFilter = new AdjustmentFilter({
    brightness: params.brightness * params.exposure,
    saturation: params.saturation,
  })

  display.filters = [lcdFilter, bloomFilter, adjustmentFilter]
  display.filterArea = new Rectangle(0, 0, padDW, padDH)
  display.addChild(terminal)

  // Add display to stage for devtools visibility, but skip during main render
  display.renderable = false
  app.stage.addChild(display)

  // displayRT — fixed resolution, no DPR scaling (padded to hide rotated edges)
  const displayRT = RenderTexture.create({
    width: padDW,
    height: padDH,
    resolution: 1,
    scaleMode: 'nearest',
  })

  // Camera Mesh (maps displayRT onto screen with 32x32 grid)
  const { vertices, uvs, indices } = createMeshGeometry(screenW, screenH, params.screenPadding)
  const cameraMeshBaseVerts = new Float32Array(vertices)
  const cameraMeshVerts = new Float32Array(vertices)
  const cameraMesh = new MeshSimple({
    texture: displayRT,
    vertices: cameraMeshVerts,
    uvs,
    indices,
    label: 'camera',
  })
  // Breathing wrapper (subtle scale pulse) → scroll-zoom wrapper (user scroll zoom)
  const breathingWrap = new Container({ label: 'breathingWrap' })
  const scrollZoomWrap = new Container({ label: 'scrollZoomWrap' })
  scrollZoomWrap.addChild(cameraMesh)
  breathingWrap.addChild(scrollZoomWrap)
  app.stage.addChild(breathingWrap)

  // Dead pixels — rendered in display-texture space so they align with LCD grid cells
  const dpLayers = buildDeadPixelLayers(padDW, padDH, params.deadPixelsEnabled)
  const deadPixelTexture = Texture.from({ resource: dpLayers.dark, scaleMode: 'nearest' })
  const deadPixelSprite = new Sprite({ texture: deadPixelTexture, label: 'deadPixels' })
  deadPixelSprite.width = padDW
  deadPixelSprite.height = padDH
  deadPixelSprite.blendMode = 'multiply'
  deadPixelSprite.visible = params.deadPixelsEnabled

  const stuckTexture = Texture.from({ resource: dpLayers.stuck, scaleMode: 'nearest' })
  const stuckPixelSprite = new Sprite({ texture: stuckTexture, label: 'stuckPixels' })
  stuckPixelSprite.width = padDW
  stuckPixelSprite.height = padDH
  stuckPixelSprite.blendMode = 'add'
  stuckPixelSprite.visible = params.deadPixelsEnabled

  display.addChild(deadPixelSprite, stuckPixelSprite)

  const glareCanvas = buildGlareCanvas(screenW, screenH)
  const glareTexture = Texture.from({ resource: glareCanvas, scaleMode: 'linear' })
  const glareSprite = new Sprite({ texture: glareTexture, label: 'glare' })
  glareSprite.blendMode = 'screen'
  glareSprite.alpha = params.glareOpacity
  glareSprite.x = screenW - glareSprite.width * 0.4
  glareSprite.y = -screenH * 0.1

  const overlayContainer = new Container({ label: 'overlays' })
  overlayContainer.addChild(glareSprite)
  scrollZoomWrap.addChild(overlayContainer)

  // Measure char width
  const chMetric = new Text({
    text: 'M',
    style: { fontFamily: FONT_FAMILY, fontSize: params.fontSize },
  })
  const chW = chMetric.width
  chMetric.destroy()

  return {
    app,
    display,
    terminal,
    bgContainer,
    tuiContainer,
    scrollContainer,
    spinnerLine,
    metaLine,
    bottomChrome,
    inputContainer,
    overlayContainer,
    glyphText,
    verbText,
    ellipsisText,
    highlightText,
    metaText,
    caretText,
    inputText,
    bootOutputText,
    bootHintText,
    ruleTop,
    promptText,
    ruleBottom,
    statusText,
    permsText,
    infoText,
    lcdFilter,
    bloomFilter,
    adjustmentFilter,
    deadPixelSprite,
    stuckPixelSprite,
    glareSprite,
    breathingWrap,
    scrollZoomWrap,
    cameraMesh,
    cameraMeshBaseVerts,
    cameraMeshVerts,
    displayRT,
    contentW: dW,
    contentH: dH,
    padY,
    chW,
  }
}
