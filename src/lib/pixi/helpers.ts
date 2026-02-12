import { FONT_FAMILY } from './constants'
import type { Params } from './params'

export function hexToNum(hex: string): number {
  return Number.parseInt(hex.slice(1), 16)
}

export function numToHex(n: number): string {
  return `#${(`000000${(n >>> 0).toString(16)}`).slice(-6)}`
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function normalizeVerbs(lines: string[]): string[] {
  return lines.map((l) =>
    typeof l === 'string' ? l.replace(/^\s*I(?:[\u2019']m| am)\s+/i, '') : '',
  )
}

export function fmtElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

export function repeat(ch: string, n: number): string {
  return n > 0 ? ch.repeat(n) : ''
}

export function makeStyle(color: number, params: Params) {
  return { fontFamily: FONT_FAMILY, fontSize: params.fontSize, fill: color }
}

export function blankLine(params: Params) {
  return { t: ' ', c: hexToNum(params.bgColor) }
}
