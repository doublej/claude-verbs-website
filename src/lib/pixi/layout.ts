import type { Container, Text } from 'pixi.js'
import { LAYOUT } from './constants'
import type { LineDef } from './events'
import { countColumns, repeat } from './helpers'
import { layoutMobile } from './mobile'
import type { Params } from './params'
import { type Machine, State } from './state-machine'
import type { TextPool } from './text-pool'

export interface LayoutCtx {
  chW: number
  lineHeight: number
  prevRuleCols: number
}

export function createLayoutCtx(chW: number, fontSize: number, offset: number): LayoutCtx {
  const baseLineHeight = Math.round(fontSize * LAYOUT.lineHeightRatio)
  return { chW, lineHeight: baseLineHeight + offset, prevRuleCols: 0 }
}

export function layoutScrollItems(
  scrollItems: (Text | Container)[],
  spinnerY: number,
  lctx: LayoutCtx,
  scrollContainer: Container,
  pool: TextPool,
): void {
  const gap = lctx.lineHeight
  for (let i = 0; i < scrollItems.length; i++)
    scrollItems[i].y = spinnerY - gap - (scrollItems.length - i) * lctx.lineHeight
  while (scrollItems.length > 0 && scrollItems[0].y + lctx.lineHeight < 0) {
    scrollContainer.removeChild(scrollItems[0])
    if ('style' in scrollItems[0]) pool.release(scrollItems[0] as Text)
    scrollItems.shift()
  }
}

export function addScrollLine(
  line: LineDef,
  scrollItems: (Text | Container)[],
  scrollContainer: Container,
  pool: TextPool,
  lctx: LayoutCtx,
  spinnerY: number,
): void {
  const txt = pool.acquire(line.t, line.c)
  txt.x = Math.round((line.col || LAYOUT.defaultCol) * lctx.chW)
  scrollContainer.addChild(txt)
  scrollItems.push(txt)
  layoutScrollItems(scrollItems, spinnerY, lctx, scrollContainer, pool)
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: multi-state layout dispatch
export function layout(
  screenW: number,
  screenH: number,
  params: Params,
  machine: Machine,
  lctx: LayoutCtx,
  ui: {
    spinnerLine: Container
    metaLine: Container
    scrollContainer: Container
    scrollItems: (Text | Container)[]
    bottomChrome: Container
    inputContainer: Container
    caretText: Text
    inputText: Text
    bootOutputText: Text
    bootHintText: Text
    verbText: Text
    ellipsisText: Text
    ruleTop: Text
    ruleBottom: Text
    promptText: Text
    statusText: Text
    permsText: Text
    infoText: Text
  },
  pool: TextPool,
): void {
  if (machine.mobile) {
    layoutMobile(screenW, screenH, lctx, ui)
    return
  }

  const { chW, lineHeight: lh } = lctx
  const col3 = Math.round(LAYOUT.defaultCol * chW)
  ui.verbText.x = col3
  ui.ellipsisText.x = ui.verbText.x + Math.round(countColumns(ui.verbText.text) * chW)

  const leftX =
    params.absoluteX !== 0
      ? Math.round(chW * params.absoluteX)
      : Math.round(chW * (2 + params.offsetX))

  const spinnerY =
    params.absoluteY !== 0
      ? Math.round(lh * params.absoluteY)
      : Math.round(screenH / 2 - lh + lh * params.offsetY)

  const scrollY = params.absoluteY !== 0 ? Math.round(lh * params.absoluteY) : 0

  ui.spinnerLine.x = leftX
  ui.spinnerLine.y = spinnerY
  ui.metaLine.x = leftX + col3
  ui.metaLine.y = Math.round(ui.spinnerLine.y + 2 * lh)
  ui.scrollContainer.x = leftX
  ui.scrollContainer.y = scrollY

  const pad = 0
  const ruleCols = Math.max(1, Math.floor(screenW / chW) - 2)
  if (ruleCols !== lctx.prevRuleCols) {
    const rule = repeat('\u2500', ruleCols)
    ui.ruleTop.text = rule
    ui.ruleBottom.text = rule
    lctx.prevRuleCols = ruleCols
  }

  const ch1 = Math.round(chW)
  ui.bottomChrome.x = leftX
  ui.bottomChrome.y = scrollY

  if (machine.current === State.BOOT || machine.current === State.BOOT_READY) {
    ui.inputContainer.visible = true
    ui.inputContainer.x = leftX
    ui.inputContainer.y = Math.round(lh)
    const outputLines = ui.bootOutputText.text ? ui.bootOutputText.text.split('\n').length : 0
    ui.bootOutputText.x = 0
    ui.bootOutputText.y = Math.round(lh)
    const promptY = outputLines > 0 ? Math.round((outputLines + 2) * lh) : 0
    ui.caretText.y = promptY
    ui.inputText.y = promptY
    ui.bootHintText.x = 0
    ui.bootHintText.y = promptY + Math.round(lh)
    ui.scrollContainer.visible = false
    ui.spinnerLine.visible = false
    ui.metaLine.visible = false
    ui.bottomChrome.visible = false
    return
  }

  ui.inputContainer.visible = false
  ui.caretText.y = 0
  ui.inputText.y = 0
  ui.scrollContainer.visible = true
  ui.spinnerLine.visible = machine.current === State.DEMO || machine.current === State.POST_DEMO
  ui.metaLine.visible = machine.current === State.DEMO || machine.current === State.POST_DEMO
  ui.bottomChrome.visible = true

  if (machine.current === State.IDLE || machine.current === State.BROWSING) {
    const idleOffsetY = LAYOUT.idleOffsetLines * lh
    ui.scrollContainer.y = scrollY + idleOffsetY
    ui.bottomChrome.y = scrollY + idleOffsetY
    layoutIdle(ui, lctx, screenH, pad, ch1)
  } else {
    layoutScrollItems(ui.scrollItems, ui.spinnerLine.y, lctx, ui.scrollContainer, pool)
    layoutChrome(ui, ui.metaLine.y + lh + pad, lh, pad, ch1)
  }
}

function layoutIdle(
  ui: {
    scrollItems: (Text | Container)[]
    ruleTop: Text
    ruleBottom: Text
    promptText: Text
    statusText: Text
    permsText: Text
    infoText: Text
  },
  lctx: LayoutCtx,
  screenH: number,
  pad: number,
  ch1: number,
): void {
  const lh = lctx.lineHeight
  const headerH = ui.scrollItems.length * lh
  const chromeH = 6 * lh + 6 * pad
  const topY = Math.round((screenH - headerH - chromeH) / 2)
  for (let i = 0; i < ui.scrollItems.length; i++) ui.scrollItems[i].y = topY + i * lh
  layoutChrome(ui, topY + headerH + pad, lh, pad, ch1)
}

function layoutChrome(
  ui: {
    ruleTop: Text
    ruleBottom: Text
    promptText: Text
    statusText: Text
    permsText: Text
    infoText: Text
  },
  baseY: number,
  lh: number,
  pad: number,
  ch1: number,
): void {
  ui.ruleTop.x = ch1
  ui.ruleTop.y = baseY
  ui.promptText.x = ch1
  ui.promptText.y = baseY + lh + pad
  ui.ruleBottom.x = ch1
  ui.ruleBottom.y = baseY + lh * 2 + pad * 2
  ui.statusText.x = ch1
  ui.statusText.y = baseY + lh * 3 + pad * 3
  ui.permsText.x = ch1
  ui.permsText.y = baseY + lh * 4 + pad * 4
  ui.infoText.x = ch1
  ui.infoText.y = baseY + lh * 5 + pad * 5
  ui.statusText.visible = true
  ui.permsText.visible = true
  ui.infoText.visible = true
}
