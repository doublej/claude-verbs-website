import { Container, Graphics, Text } from 'pixi.js'
import { FONT_FAMILY, PALETTE } from './constants'

const DOUBLE_TAP_MS = 500
const HOLD_MS = 3000

export interface EscSkip {
  activated: boolean
  holding: boolean
  progress: number
  lastEscDown: number
  holdStart: number
  popup: Container
  bar: Graphics
  barW: number
  barH: number
}

export function createEscSkip(
  fontSize: number,
  chW: number,
  contentW: number,
  contentH: number,
): EscSkip {
  const popup = new Container({ label: 'escSkipPopup' })
  popup.visible = false

  const label = 'HOLD ESC 3 SEC.'
  const pad = Math.round(chW * 2)
  const barW = Math.round(label.length * chW)
  const barH = Math.round(fontSize * 0.3)
  const boxW = barW + pad * 2
  const boxH = Math.round(fontSize * 4)

  const bg = new Graphics()
  bg.rect(0, 0, boxW, boxH)
  bg.fill({ color: 0x000000, alpha: 0.9 })
  bg.stroke({ color: PALETTE.border, width: 1 })
  popup.addChild(bg)

  const txt = new Text({
    text: label,
    style: { fontFamily: FONT_FAMILY, fontSize, fill: PALETTE.active },
  })
  txt.x = pad
  txt.y = Math.round(boxH * 0.22)
  popup.addChild(txt)

  const track = new Graphics()
  track.rect(0, 0, barW, barH)
  track.fill({ color: PALETTE.border })
  track.x = pad
  track.y = Math.round(boxH * 0.62)
  popup.addChild(track)

  const bar = new Graphics()
  bar.x = pad
  bar.y = Math.round(boxH * 0.62)
  popup.addChild(bar)

  popup.x = Math.round((contentW - boxW) / 2)
  popup.y = Math.round((contentH - boxH) / 2)

  return {
    activated: false,
    holding: false,
    progress: 0,
    lastEscDown: 0,
    holdStart: 0,
    popup,
    bar,
    barW,
    barH,
  }
}

/** Returns true when first activated (double-tap detected). */
export function escKeyDown(esc: EscSkip, repeat: boolean): boolean {
  const now = Date.now()
  if (!esc.activated) {
    if (!repeat && now - esc.lastEscDown < DOUBLE_TAP_MS) {
      esc.activated = true
      esc.holding = true
      esc.holdStart = now
      esc.popup.visible = true
      return true
    }
    if (!repeat) esc.lastEscDown = now
    return false
  }
  if (!repeat && !esc.holding) {
    esc.holding = true
    esc.holdStart = now
  }
  return false
}

export function escKeyUp(esc: EscSkip): void {
  esc.holding = false
  esc.progress = 0
  redrawBar(esc)
}

/** Returns current progress 0–1. */
export function tickEsc(esc: EscSkip): number {
  if (!esc.activated || !esc.holding) return esc.progress
  esc.progress = Math.min((Date.now() - esc.holdStart) / HOLD_MS, 1)
  redrawBar(esc)
  return esc.progress
}

export function resetEsc(esc: EscSkip): void {
  esc.activated = false
  esc.holding = false
  esc.progress = 0
  esc.popup.visible = false
}

function redrawBar(esc: EscSkip): void {
  esc.bar.clear()
  if (esc.progress > 0) {
    esc.bar.rect(0, 0, Math.round(esc.barW * esc.progress), esc.barH)
    esc.bar.fill({ color: PALETTE.prompt })
  }
}
