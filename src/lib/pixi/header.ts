import type { VerbSets } from '$lib/data/types'
import { LAYOUT, PALETTE } from './constants'
import { hexToNum, repeat } from './helpers'
import type { Params } from './params'

export interface HeaderPart {
  text: string
  color: number
}

export interface HeaderRow {
  parts: HeaderPart[]
}

export function buildHeaderRows(cols: number, sets: VerbSets, params: Params): HeaderRow[] {
  let n = 0
  for (const k of Object.keys(sets)) n += sets[k].length

  const inner = cols - 2
  const lw = LAYOUT.headerLeftCol
  const rw = inner - lw - 1
  const cv = hexToNum(params.colorVerb)
  const cm = PALETTE.suggestion

  function ctr(s: string, w: number): string {
    const g = Math.max(0, w - s.length)
    const l = Math.floor(g / 2)
    return repeat(' ', l) + s + repeat(' ', g - l)
  }
  function rpad(s: string, w: number): string {
    return s + repeat(' ', Math.max(0, w - s.length))
  }
  function row(left: string, right: string, c: number): HeaderRow {
    return {
      parts: [
        { text: '\u2502', color: cv },
        { text: ctr(left, lw), color: c },
        { text: '\u2502', color: cv },
        { text: rpad(` ${right}`, rw), color: c },
        { text: '\u2502', color: cv },
      ],
    }
  }

  const title = ' Claude Verbs '
  const dashes = inner - title.length
  const dl = Math.floor(dashes / 2)

  return [
    {
      parts: [
        { text: `\u256d${repeat('\u2500', dl)}`, color: cv },
        { text: title, color: PALETTE.accent },
        { text: `${repeat('\u2500', dashes - dl)}\u256e`, color: cv },
      ],
    },
    row('', '', PALETTE.border),
    row('Welcome!', 'Getting started', cv),
    row('', 'bunx github:doublej/claude-verbs-cli install <name>', PALETTE.dim),
    row('\u2590\u259b\u2588\u2588\u2588\u259c\u258c', repeat('\u2500', 25), cv),
    row('\u259d\u259c\u2588\u2588\u2588\u2588\u2588\u259b\u2598', `${n} verb sets available`, cv),
    row('\u2598\u2598 \u259d\u259d', 'Arrow keys to browse', PALETTE.dim),
    row('', '', PALETTE.border),
    row('claude-verbs v0.1', '', cv),
    row('', '', PALETTE.border),
    { parts: [{ text: `\u2570${repeat('\u2500', inner)}\u256f`, color: cv }] },
  ]
}
