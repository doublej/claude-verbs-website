import {
  C_ACCENT,
  C_BORDER,
  C_ERR,
  C_LINENUM,
  C_OK,
  C_OUT,
  C_PATH,
  C_PROMPT,
  C_TOOL,
  C_WARN,
} from './constants'
import { blankLine, pick, randInt, repeat } from './helpers'
import type { Params } from './params'

export interface LineDef {
  t: string
  c: number
  col?: number
}

interface Event {
  lines: LineDef[]
  burstMs?: number
}

const FILES = [
  'src/cli.ts',
  'src/commands.ts',
  'src/settings.ts',
  'src/sets.ts',
  'src/types.ts',
  'package.json',
  'tsconfig.json',
  'CLAUDE.md',
  'sets/freddy.json',
  'biome.json',
  'justfile',
  'src/build-site.ts',
]
const GREP_TERMS = ['loadSets', 'VerbSet', 'import.*from', 'ClaudeSettings', 'readFile', 'export']
const BASH_CMDS = [
  { cmd: 'bun run lint', out: ['Checked 21 files. No fixes.'] },
  { cmd: 'bun run test', out: ['\u2713 3 passed (7 tests)'] },
  { cmd: 'bunx tsc --noEmit', out: ['No errors found.'] },
  { cmd: 'bun run build', out: ['Built in 0.12s'] },
  { cmd: 'git status', out: ['2 files changed, 14 insertions'] },
  { cmd: 'git diff --stat', out: ['3 files changed, 42(+), 7(-)'] },
]
const ERROR_MSGS = [
  { msg: "Cannot find module './utils'", detail: 'at resolve (node:internal/modules)' },
  { msg: "Type 'string' not assignable to 'number'", detail: 'src/types.ts:14:5' },
  { msg: 'ENOENT: no such file or directory', detail: "open '/tmp/.cache/build'" },
]
const PANEL_LINES = [
  ['Plan: update settings module', 'Step 1: read current config', 'Step 2: merge verb overrides'],
  ['Context: claude-verbs CLI', 'Stack: TypeScript + Bun', 'Entry: src/cli.ts'],
  ['Dependencies resolved', 'bun@1.1.42', 'pixi.js@7.4.2', 'vitest@3.0.4'],
]

function mkRead(): Event {
  return { lines: [{ t: `Read ${pick(FILES)}`, c: C_TOOL }] }
}
function mkGlob(): Event {
  const pat = pick(['**/*.ts', 'sets/**/*.json', 'src/**/*.ts', 'templates/**/*.html'])
  return { lines: [{ t: `Glob ${pat} (${randInt(2, 12)} matches)`, c: C_TOOL }] }
}
function mkGrep(): Event {
  return { lines: [{ t: `Grep "${pick(GREP_TERMS)}" (${randInt(1, 18)} matches)`, c: C_TOOL }] }
}
function mkAssistantAction(): Event {
  const act = pick(['Read', 'Edit', 'Write', 'Glob', 'Grep'])
  return {
    lines: [
      { t: `\u23fa ${act}(${pick(FILES)})`, c: C_ACCENT, col: 1 },
      { t: `\u23bf ${randInt(8, 120)} lines`, c: C_OUT, col: 1 },
    ],
    burstMs: 100,
  }
}
function mkBashCommand(): Event {
  const b = pick(BASH_CMDS)
  const lines: LineDef[] = [{ t: `Bash ${b.cmd}`, c: C_OUT }]
  for (const o of b.out) lines.push({ t: o, c: C_OK })
  return { lines, burstMs: 120 }
}
function mkDiffHunk(): Event {
  const file = pick(FILES)
  const startLine = randInt(1, 80)
  const lines: LineDef[] = [
    { t: `Edit ${file}`, c: C_PATH },
    { t: `@@ -${startLine},3 +${startLine},4 @@`, c: C_LINENUM },
  ]
  for (let d = 0; d < randInt(0, 2); d++)
    lines.push({
      t: `- ${pick(['const old = true;', 'return null;', '// TODO'])}`,
      c: C_ERR,
      col: 1,
    })
  for (let a = 0; a < randInt(1, 3); a++)
    lines.push({
      t: `+ ${pick(['const val = parse(input);', 'return result;', 'export type Config = {};'])}`,
      c: C_OK,
      col: 1,
    })
  return { lines, burstMs: 80 }
}
function mkBoxedPanel(): Event {
  const panel = pick(PANEL_LINES)
  const w = 34
  const lines: LineDef[] = [{ t: `\u256d${repeat('\u2500', w)}\u256e`, c: C_BORDER, col: 1 }]
  for (const p of panel) {
    const pad = w - p.length
    lines.push({ t: `\u2502 ${p}${repeat(' ', Math.max(0, pad - 1))}\u2502`, c: C_BORDER, col: 1 })
  }
  lines.push({ t: `\u2570${repeat('\u2500', w)}\u256f`, c: C_BORDER, col: 1 })
  return { lines, burstMs: 60 }
}
function mkPromptLine(): Event {
  const cmds = [
    '\u276f build',
    '\u276f /fast',
    '\u276f test --watch',
    '\u276f lint --fix',
    '\u276f git push',
  ]
  return { lines: [{ t: pick(cmds), c: C_PROMPT, col: 1 }] }
}
function mkErrorBlock(): Event {
  const e = pick(ERROR_MSGS)
  return {
    lines: [
      { t: `Error: ${e.msg}`, c: C_ERR },
      { t: e.detail, c: C_OUT },
    ],
    burstMs: 100,
  }
}
function mkSearchSummary(): Event {
  const msgs: LineDef[] = [
    { t: '\u2713 tests passed (7/7)', c: C_OK, col: 1 },
    { t: '\u2713 lint clean', c: C_OK, col: 1 },
    { t: '\u2713 typecheck passed', c: C_OK, col: 1 },
    { t: 'Validation: 0 errors, 2 warnings', c: C_WARN },
    { t: 'warn: nl/multi-lul.json: 54 verbs', c: C_WARN },
    { t: `Duration: ${randInt(120, 900)}ms`, c: C_OUT },
  ]
  return { lines: [pick(msgs)] }
}
function mkCompletionTagline(): Event {
  const msgs: LineDef[] = [
    { t: `Cooked for ${randInt(8, 45)}s`, c: C_OUT },
    { t: `\u2193 ${randInt(800, 4200)} tokens used`, c: C_OUT, col: 1 },
    { t: `Done in ${randInt(2, 18)}s`, c: C_OUT },
  ]
  return { lines: [pick(msgs)] }
}
function mkModeToggle(): Event {
  return {
    lines: [
      { t: '/fast', c: C_PROMPT, col: 1 },
      { t: 'Fast mode enabled', c: C_OK },
    ],
    burstMs: 150,
  }
}

export function mkStateDiagram(): Event {
  return {
    lines: [
      { t: '', c: C_OUT },
      { t: '## ASCII State Diagram', c: C_ACCENT },
      { t: '', c: C_OUT },
      {
        t: '                    \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510',
        c: C_BORDER,
      },
      {
        t: '              \u250c\u2500\u2500\u2500\u2500\u25b6\u2502   IDLE (0)  \u2502\u25c0\u2500\u2500\u2500\u2500 Start',
        c: C_BORDER,
      },
      {
        t: '              \u2502     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2518',
        c: C_BORDER,
      },
      { t: '              \u2502            \u2502 ENTER', c: C_BORDER },
      { t: '              \u2502            \u25bc', c: C_BORDER },
      {
        t: '              \u2502     \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510',
        c: C_BORDER,
      },
      { t: '              \u2502     \u2502  DEMO (2)   \u2502', c: C_BORDER },
      {
        t: '              \u2502     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2518',
        c: C_BORDER,
      },
      { t: '              \u2502       ESC  \u2502  DEMO_TIMEOUT (60s)', c: C_BORDER },
      { t: '              \u2502            \u25bc', c: C_BORDER },
      {
        t: '        ESC   \u2502     \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510',
        c: C_BORDER,
      },
      {
        t: '     \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u25b6\u2502POST_DEMO (3)\u2502',
        c: C_BORDER,
      },
      {
        t: '     \u2502              \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2518',
        c: C_BORDER,
      },
      { t: '     \u2502                     \u2502 ENTER (action)', c: C_BORDER },
      { t: '     \u2502                     \u251c\u2500 copy command', c: C_BORDER },
      { t: '     \u2502                     \u2514\u2500 navigate marketplace', c: C_BORDER },
      { t: '     \u2502', c: C_BORDER },
      {
        t: '     \u2502              \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
        c: C_ERR,
      },
      {
        t: '     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2551 BUGGED (4) \u2551\u25c0\u2500\u2500\u2500\u2500 SHIFT_TAB from any state',
        c: C_ERR,
      },
      {
        t: '       ESC to       \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d      (easter egg)',
        c: C_ERR,
      },
      { t: '     previous', c: C_BORDER },
      { t: '', c: C_OUT },
      { t: 'Notes:', c: C_ACCENT },
      {
        t: '  \u2022 BROWSING state exists but is not actively used in main flow',
        c: C_OUT,
        col: 1,
      },
      {
        t: '  \u2022 All interactive states can transition to BUGGED via SHIFT_TAB',
        c: C_OUT,
        col: 1,
      },
      {
        t: '  \u2022 BUGGED uses double-line box to indicate special/easter egg status',
        c: C_OUT,
        col: 1,
      },
      { t: '', c: C_OUT },
    ],
    burstMs: 40,
  }
}

export function mkPromo(): Event {
  return {
    lines: [
      { t: '', c: C_OUT },
      { t: ' ██████╗ ██████╗ ███╗   ██╗███████╗██╗   ██╗██╗  ████████╗', c: C_ACCENT },
      { t: '██╔════╝██╔═══██╗████╗  ██║██╔════╝██║   ██║██║  ╚══██╔══╝', c: C_ACCENT },
      { t: '██║     ██║   ██║██╔██╗ ██║███████╗██║   ██║██║     ██║', c: C_ACCENT },
      { t: '██║     ██║   ██║██║╚██╗██║╚════██║██║   ██║██║     ██║', c: C_ACCENT },
      { t: '╚██████╗╚██████╔╝██║ ╚████║███████║╚██████╔╝███████╗██║', c: C_ACCENT },
      { t: ' ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚══════╝╚═╝', c: C_ACCENT },
      { t: '', c: C_OUT },
      { t: '         ██╗   ██╗███████╗███████╗██████╗', c: C_PROMPT },
      { t: '         ██║   ██║██╔════╝██╔════╝██╔══██╗', c: C_PROMPT },
      { t: '         ██║   ██║███████╗███████╗██████╔╝', c: C_PROMPT },
      { t: '         ██║   ██║╚════██║╚════██║██╔══██╗', c: C_PROMPT },
      { t: '         ╚██████╔╝███████║███████║██║  ██║', c: C_PROMPT },
      { t: '          ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝', c: C_PROMPT },
      { t: '', c: C_OUT },
      { t: '             Interactive dialogs for', c: C_PATH },
      { t: '               Claude AI agents', c: C_PATH },
      { t: '', c: C_OUT },
      { t: '┌──────────────────────────────────────────────────────────┐', c: C_BORDER },
      { t: '│                                                          │', c: C_BORDER },
      { t: '│  ✓ Ask questions with forms, confirmations & pickers     │', c: C_OK, col: 1 },
      { t: '│  ✓ Get structured user input during agent execution      │', c: C_OK, col: 1 },
      { t: '│  ✓ Send notifications without blocking workflow          │', c: C_OK, col: 1 },
      { t: '│  ✓ Beautiful native UI · Snooze · Multi-question forms   │', c: C_OK, col: 1 },
      { t: '│                                                          │', c: C_BORDER },
      { t: '└──────────────────────────────────────────────────────────┘', c: C_BORDER },
      { t: '', c: C_OUT },
      { t: '       https://github.com/doublej/consult-user-mcp', c: C_ACCENT },
      { t: '', c: C_OUT },
      { t: '         Star · Install · Integrate · Ship better', c: C_PATH },
      { t: '', c: C_OUT },
    ],
    burstMs: 40,
  }
}

const EVENT_TABLE = [
  { fn: mkRead, w: 20 },
  { fn: mkGlob, w: 6 },
  { fn: mkGrep, w: 6 },
  { fn: mkAssistantAction, w: 12 },
  { fn: mkBashCommand, w: 8 },
  { fn: mkDiffHunk, w: 5 },
  { fn: mkBoxedPanel, w: 3 },
  { fn: mkPromptLine, w: 4 },
  { fn: mkErrorBlock, w: 2 },
  { fn: mkSearchSummary, w: 6 },
  { fn: mkCompletionTagline, w: 3 },
  { fn: mkModeToggle, w: 2 },
]
const TOTAL_WEIGHT = EVENT_TABLE.reduce((s, e) => s + e.w, 0)

export function pickEvent(): Event {
  const r = Math.random() * TOTAL_WEIGHT
  let cum = 0
  for (const entry of EVENT_TABLE) {
    cum += entry.w
    if (r < cum) return entry.fn()
  }
  return EVENT_TABLE[EVENT_TABLE.length - 1].fn()
}

export interface LineBuffer {
  currentBurstMs: number
  linesLeftInBurst: number
}

export function createLineBuffer(): LineBuffer {
  return { currentBurstMs: 0, linesLeftInBurst: 0 }
}

export function feedBuffer(buffer: LineDef[], state: LineBuffer, params: Params): void {
  if (buffer.length > 0) return
  const evt = pickEvent()
  buffer.push(...evt.lines, blankLine(params))
  state.currentBurstMs = evt.burstMs || 0
  state.linesLeftInBurst = buffer.length
}

export function nextLine(buffer: LineDef[], state: LineBuffer, params: Params): LineDef {
  feedBuffer(buffer, state, params)
  state.linesLeftInBurst--
  return buffer.shift()!
}
