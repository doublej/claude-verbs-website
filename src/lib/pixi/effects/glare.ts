export function buildGlareCanvas(w: number, h: number): HTMLCanvasElement {
  const vmax = Math.max(w, h)
  const gw = Math.round(vmax * 0.6)
  const gh = Math.round(vmax * 0.4)
  const c = document.createElement('canvas')
  c.width = gw
  c.height = gh
  const ctx = c.getContext('2d')!
  const cx = gw / 2
  const cy = gh / 2
  const r = Math.max(gw, gh) * 0.7
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grd.addColorStop(0, 'rgba(255,255,255,0.08)')
  grd.addColorStop(0.4, 'rgba(255,255,255,0.02)')
  grd.addColorStop(0.7, 'rgba(255,255,255,0)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, gw, gh)
  return c
}
