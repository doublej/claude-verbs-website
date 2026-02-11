import type { VerbSet } from '$lib/data/types'

export const SKIP_THRESHOLD = 4

export enum State {
  IDLE = 0,
  BROWSING = 1,
  DEMO = 2,
  POST_DEMO = 3,
  BUGGED = 4,
  BOOT = 5,
}

export interface Machine {
  current: State
  previous: State
  activeSet: VerbSet | null
  browseIndex: number
  skipCount: number
  postIndex: number
  demoTimer: ReturnType<typeof setTimeout> | null
  hasSubmitted: boolean
  tabCompleted: boolean
}

export function createMachine(): Machine {
  return {
    current: State.IDLE,
    previous: State.IDLE,
    activeSet: null,
    browseIndex: 0,
    skipCount: 0,
    postIndex: 0,
    demoTimer: null,
    hasSubmitted: false,
    tabCompleted: false,
  }
}

export interface PostSuggestion {
  text: string
  action: string
}

export const POST_SUGGESTIONS: PostSuggestion[] = [
  { text: 'copy command to get access to spinner verb cli', action: 'copy' },
  { text: 'show marketplace', action: 'marketplace' },
]

export type DispatchEvent =
  | 'ENTER'
  | 'ARROW_DOWN'
  | 'ARROW_UP'
  | 'TAB'
  | 'ESC'
  | 'SHIFT_TAB'
  | 'DEMO_TIMEOUT'

interface Callbacks {
  enterState: (state: State) => void
  updateSuggestion: () => void
  onMarketplace?: () => void
}

function dispatchIdle(
  event: DispatchEvent,
  m: Machine,
  localeSets: VerbSet[],
  cb: Callbacks,
): void {
  if (localeSets.length === 0) return
  if (event === 'TAB') {
    m.tabCompleted = true
    cb.updateSuggestion()
  } else if (event === 'ENTER') {
    m.activeSet = localeSets[m.browseIndex % localeSets.length]
    cb.enterState(State.DEMO)
  } else if (event === 'ARROW_DOWN') {
    m.tabCompleted = false
    m.browseIndex = (m.browseIndex + 1) % localeSets.length
    m.skipCount = 0
    cb.enterState(State.BROWSING)
  } else if (event === 'ARROW_UP') {
    m.tabCompleted = false
    m.browseIndex = (m.browseIndex - 1 + localeSets.length) % localeSets.length
    m.skipCount = 0
    cb.enterState(State.BROWSING)
  } else if (event === 'SHIFT_TAB') cb.enterState(State.BUGGED)
}

function selectActiveSet(m: Machine, localeSets: VerbSet[], idiotSet: VerbSet | null): VerbSet {
  return m.skipCount >= SKIP_THRESHOLD && idiotSet
    ? idiotSet
    : localeSets[m.browseIndex % localeSets.length]
}

function browseDown(m: Machine, localeSets: VerbSet[], idiotSet: VerbSet | null): void {
  m.skipCount++
  if (!(m.skipCount >= SKIP_THRESHOLD && idiotSet))
    m.browseIndex = (m.browseIndex + 1) % localeSets.length
}

function dispatchBrowsing(
  event: DispatchEvent,
  m: Machine,
  localeSets: VerbSet[],
  idiotSet: VerbSet | null,
  cb: Callbacks,
): void {
  if (event === 'TAB') {
    m.tabCompleted = true
    cb.updateSuggestion()
  } else if (event === 'ENTER') {
    m.activeSet = selectActiveSet(m, localeSets, idiotSet)
    cb.enterState(State.DEMO)
  } else if (event === 'ARROW_DOWN') {
    m.tabCompleted = false
    browseDown(m, localeSets, idiotSet)
    cb.updateSuggestion()
  } else if (event === 'ARROW_UP') {
    m.tabCompleted = false
    browseUp(m, idiotSet, cb)
  } else if (event === 'SHIFT_TAB') cb.enterState(State.BUGGED)
}

function browseUp(m: Machine, idiotSet: VerbSet | null, cb: Callbacks): void {
  if (m.skipCount >= SKIP_THRESHOLD && idiotSet) {
    m.skipCount = 3
    cb.updateSuggestion()
  } else if (m.browseIndex - 1 <= 0) cb.enterState(State.IDLE)
  else {
    m.browseIndex--
    m.skipCount = Math.max(0, m.skipCount - 1)
    cb.updateSuggestion()
  }
}

function dispatchPostDemo(event: DispatchEvent, m: Machine, cb: Callbacks): void {
  if (event === 'TAB') {
    m.tabCompleted = true
    cb.updateSuggestion()
  } else if (event === 'ENTER') {
    const act = POST_SUGGESTIONS[m.postIndex].action
    if (act === 'copy' && m.activeSet)
      navigator.clipboard.writeText(`bunx claude-verbs install ${m.activeSet.name}`)
    else if (act === 'marketplace') cb.onMarketplace?.()
  } else if (event === 'ARROW_DOWN') {
    m.tabCompleted = false
    m.postIndex = (m.postIndex + 1) % POST_SUGGESTIONS.length
    cb.updateSuggestion()
  } else if (event === 'ARROW_UP') {
    m.tabCompleted = false
    m.postIndex = (m.postIndex - 1 + POST_SUGGESTIONS.length) % POST_SUGGESTIONS.length
    cb.updateSuggestion()
  } else if (event === 'SHIFT_TAB') cb.enterState(State.BUGGED)
}

export function dispatch(
  event: DispatchEvent,
  machine: Machine,
  localeSets: VerbSet[],
  idiotSet: VerbSet | null,
  callbacks: Callbacks,
): void {
  switch (machine.current) {
    case State.IDLE:
      dispatchIdle(event, machine, localeSets, callbacks)
      break
    case State.BROWSING:
      dispatchBrowsing(event, machine, localeSets, idiotSet, callbacks)
      break
    case State.DEMO:
      if (event === 'ESC' || event === 'DEMO_TIMEOUT') callbacks.enterState(State.POST_DEMO)
      else if (event === 'SHIFT_TAB') callbacks.enterState(State.BUGGED)
      break
    case State.POST_DEMO:
      dispatchPostDemo(event, machine, callbacks)
      break
    case State.BUGGED:
      if (event === 'ESC') callbacks.enterState(machine.previous)
      break
  }
}
