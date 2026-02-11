let seed = 42

function seededRand(): number {
  seed = (seed * 16807 + 0) % 2147483647
  return seed / 2147483647
}

export function buildDeadPixelLayer(w: number, h: number, enabled: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas')
  const dpr = window.devicePixelRatio || 1
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  if (!enabled) return c

  const ctx = c.getContext('2d')!
  const px = Math.round(3 * dpr)
  const theme = document.documentElement.getAttribute('data-theme')
  ctx.fillStyle = theme === 'light' ? '#d0d0d0' : '#0a0c10'
  seed = 42
  for (let i = 0; i < 2; i++) {
    const x = Math.round((0.15 + seededRand() * 0.7) * c.width)
    const y = Math.round((0.1 + seededRand() * 0.6) * c.height)
    ctx.fillRect(x, y, px, px)
  }
  return c
}
