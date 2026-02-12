import { SEQUENCE } from './config'

const COMMAND = 'claude-verbs run'
const BASE_FRAME_MS = 100

export interface BootAnim {
  timers: ReturnType<typeof setTimeout>[]
  blinkId: ReturnType<typeof setInterval> | null
}

export function createBootAnim(): BootAnim {
  return { timers: [], blinkId: null }
}

export function destroyBootAnim(b: BootAnim): void {
  for (const t of b.timers) clearTimeout(t)
  if (b.blinkId) clearInterval(b.blinkId)
  b.timers.length = 0
  b.blinkId = null
}

export interface BootUI {
  setPrompt: (text: string) => void
  setInput: (text: string) => void
  setOutput: (text: string) => void
  setHint: (text: string) => void
  onReady: () => void
}

function scale(ms: number, frameMs: number): number {
  return Math.round(ms * (frameMs / BASE_FRAME_MS))
}

function detectOS(ua: string): string {
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Linux')) return 'Linux'
  return 'Unknown OS'
}

function detectBrowser(ua: string): string {
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  return 'Unknown Browser'
}

function buildDetectLines(): string[] {
  const ua = navigator.userAgent
  const sessionId = Math.random().toString(36).slice(2, 10)
  return [
    `os: ${detectOS(ua)}`,
    `browser: ${detectBrowser(ua)}`,
    `display: ${window.screen.width}\u00d7${window.screen.height}`,
    `locale: ${navigator.language}`,
    `session: ${sessionId}`,
  ]
}

export function runBootAnim(b: BootAnim, frameMs: number, ui: BootUI): void {
  const cursor = '\u2588'
  let cursorOn = true

  ui.setPrompt('$ ')
  ui.setInput(cursor)
  ui.setOutput('')
  ui.setHint('')

  b.blinkId = setInterval(
    () => {
      cursorOn = !cursorOn
      ui.setInput(cursorOn ? cursor : '')
    },
    scale(SEQUENCE.boot.blinkMs, frameMs),
  )

  b.timers.push(
    setTimeout(
      () => {
        if (b.blinkId) clearInterval(b.blinkId)
        b.blinkId = null
        showDetectLines()
      },
      scale(SEQUENCE.boot.preBlinkMs, frameMs),
    ),
  )

  function showDetectLines(): void {
    const lines = buildDetectLines()
    let shown = 0

    function showNext(): void {
      if (shown < lines.length) {
        shown++
        ui.setOutput(lines.slice(0, shown).join('\n'))
        b.timers.push(setTimeout(showNext, scale(SEQUENCE.boot.detectLineMs, frameMs)))
      } else {
        b.timers.push(setTimeout(startTypeCommand, scale(SEQUENCE.boot.postDetectMs, frameMs)))
      }
    }

    showNext()
  }

  function startTypeCommand(): void {
    ui.setOutput('')
    typeChar(0)
  }

  function typeChar(i: number): void {
    const suffix = i < COMMAND.length ? cursor : ''
    ui.setInput(COMMAND.slice(0, i) + suffix)
    if (i < COMMAND.length) {
      b.timers.push(setTimeout(() => typeChar(i + 1), scale(SEQUENCE.boot.charMs, frameMs)))
    } else {
      b.timers.push(setTimeout(showReady, scale(SEQUENCE.boot.postTypeMs, frameMs)))
    }
  }

  function showReady(): void {
    ui.setInput(COMMAND)
    ui.setHint(' \u2219 press Enter to launch interactive demo')
    ui.onReady()
  }
}
