import { SEQUENCE } from './config'
import { SPINNER_FRAMES, SPINNER_TIMELINE } from './constants'

const COMMAND = 'claude-verbs run'
const BASE_FRAME_MS = 100

export interface BootAnim {
  timers: ReturnType<typeof setTimeout>[]
  blinkId: ReturnType<typeof setInterval> | null
  spinnerId: ReturnType<typeof setInterval> | null
}

export function createBootAnim(): BootAnim {
  return { timers: [], blinkId: null, spinnerId: null }
}

export function destroyBootAnim(b: BootAnim): void {
  for (const t of b.timers) clearTimeout(t)
  if (b.blinkId) clearInterval(b.blinkId)
  if (b.spinnerId) clearInterval(b.spinnerId)
  b.timers.length = 0
  b.blinkId = null
  b.spinnerId = null
}

export interface BootUI {
  setPrompt: (text: string) => void
  setInput: (text: string) => void
  onDone: () => void
}

function scale(ms: number, frameMs: number): number {
  return Math.round(ms * (frameMs / BASE_FRAME_MS))
}

export function runBootAnim(b: BootAnim, frameMs: number, ui: BootUI): void {
  const cursor = '\u2588'
  let cursorOn = true

  ui.setPrompt('$ ')
  ui.setInput(cursor)

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
        typeChar(0)
      },
      scale(SEQUENCE.boot.preBlinkMs, frameMs),
    ),
  )

  function typeChar(i: number): void {
    const suffix = i < COMMAND.length ? cursor : ''
    ui.setInput(COMMAND.slice(0, i) + suffix)
    if (i < COMMAND.length) {
      b.timers.push(setTimeout(() => typeChar(i + 1), scale(SEQUENCE.boot.charMs, frameMs)))
    } else {
      b.timers.push(setTimeout(startLoad, scale(SEQUENCE.boot.postTypeMs, frameMs)))
    }
  }

  function startLoad(): void {
    let tick = 0
    ui.setPrompt(`${SPINNER_FRAMES[0]} `)
    ui.setInput('Loading\u2026')
    b.spinnerId = setInterval(() => {
      tick++
      ui.setPrompt(`${SPINNER_FRAMES[SPINNER_TIMELINE[tick % SPINNER_TIMELINE.length]]} `)
    }, frameMs)
    b.timers.push(
      setTimeout(
        () => {
          if (b.spinnerId) clearInterval(b.spinnerId)
          b.spinnerId = null
          ui.setPrompt('$ ')
          ui.setInput(COMMAND)
          b.timers.push(
            setTimeout(
              () => {
                destroyBootAnim(b)
                ui.onDone()
              },
              scale(SEQUENCE.boot.postLoadMs, frameMs),
            ),
          )
        },
        scale(SEQUENCE.boot.loadMs, frameMs),
      ),
    )
  }
}
