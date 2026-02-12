import { Graphics } from 'pixi.js'
import type { Params } from './params'

const SIZE = 20
const COLOR = 0xff0000
const ALPHA = 0.7

export function createFocusCrosshair(parent: { addChild: (c: Graphics) => void }): Graphics {
  const g = new Graphics({ label: 'focusCrosshair' })
  g.visible = false
  parent.addChild(g)
  return g
}

export function updateFocusCrosshair(g: Graphics, p: Params): void {
  if (!g.visible) return
  const x = p.focusTargetX
  const y = p.focusTargetY
  g.clear()
  g.setStrokeStyle({ width: 2, color: COLOR, alpha: ALPHA })
  g.moveTo(x - SIZE, y).lineTo(x + SIZE, y).stroke()
  g.moveTo(x, y - SIZE).lineTo(x, y + SIZE).stroke()
  g.circle(x, y, SIZE * 0.6).stroke()
}
