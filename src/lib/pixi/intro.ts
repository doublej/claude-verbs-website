import { PALETTE } from './constants'
import type { HeaderRow } from './header'

/* eslint-disable no-irregular-whitespace -- ASCII art uses special chars */

const CLAUDE_ART = [
  ' ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗',
  '██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝',
  '██║     ██║     ███████║██║   ██║██║  ██║█████╗  ',
  '██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝  ',
  '╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗',
  ' ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝╚═════╝ ╚══════╝',
]

const VERBS_ART = [
  '██╗   ██╗███████╗██████╗ ██████╗ ███████╗',
  '██║   ██║██╔════╝██╔══██╗██╔══██╗██╔════╝',
  '╚██╗ ██╔╝█████╗  ██████╔╝██████╔╝███████╗',
  ' ╚████╔╝ ██╔══╝  ██╔══██╗██╔══██╗╚════██║',
  '  ╚██╔╝  ███████╗██║  ██║██████╔╝███████║',
  '   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝',
]

function artRow(text: string, color: number): HeaderRow {
  return { parts: [{ text, color }] }
}

function textRow(text: string, color: number): HeaderRow {
  return { parts: [{ text, color }] }
}

export function buildIntroRows(): HeaderRow[] {
  const blank: HeaderRow = { parts: [{ text: '', color: PALETTE.dim }] }

  return [
    blank,
    textRow('  Loading Claude Verbs...', PALETTE.dim),
    blank,
    ...CLAUDE_ART.map((l) => artRow(`  ${l}`, PALETTE.accent)),
    ...VERBS_ART.map((l) => artRow(`     ${l}`, PALETTE.prompt)),
    blank,
    textRow("  The internet's favourite place for", PALETTE.dim),
    textRow('  Anthropic Claude Code verb spinner', PALETTE.dim),
    textRow('  replacement packs.', PALETTE.dim),
    blank,
    textRow('  ─────────────────────────────────────────', PALETTE.border),
    blank,
  ]
}
