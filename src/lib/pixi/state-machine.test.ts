import type { VerbSet } from '$lib/data/types'
import { describe, expect, it } from 'vitest'
import { State, createMachine, dispatch } from './state-machine'

function mkSet(name: string): VerbSet {
  return {
    name,
    displayName: name,
    description: `${name} verbs`,
    author: 'test',
    github: 'https://example.com',
    language: 'en',
    category: 'original',
    verbCount: 2,
    verbs: ['think', 'ship'],
    createdAt: '2026-02-11T00:00:00+00:00',
  }
}

function mkCallbacks(machine: ReturnType<typeof createMachine>) {
  return {
    enterState: (state: State) => {
      machine.previous = machine.current
      machine.current = state
    },
    updateSuggestion: () => {},
  }
}

describe('state machine browse transitions', () => {
  it('enters BROWSING on ARROW_DOWN from IDLE', () => {
    const machine = createMachine()
    const sets = [mkSet('alpha'), mkSet('beta'), mkSet('gamma')]

    dispatch('ARROW_DOWN', machine, sets, null, mkCallbacks(machine))

    expect(machine.current).toBe(State.BROWSING)
    expect(machine.browseIndex).toBe(1)
    expect(machine.skipCount).toBe(0)
  })

  it('enters BROWSING on ARROW_UP from IDLE and wraps the index', () => {
    const machine = createMachine()
    const sets = [mkSet('alpha'), mkSet('beta'), mkSet('gamma')]

    dispatch('ARROW_UP', machine, sets, null, mkCallbacks(machine))

    expect(machine.current).toBe(State.BROWSING)
    expect(machine.browseIndex).toBe(2)
    expect(machine.skipCount).toBe(0)
  })
})
