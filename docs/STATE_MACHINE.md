# PixiJS Home Page: State Machine Architecture

## Overview

The interactive CRT terminal animation on the home page is controlled by a finite state machine that guides users through browsing and demonstrating verb sets.

**Core implementation:**
- [`src/lib/pixi/state-machine.ts`](../src/lib/pixi/state-machine.ts) — State enum, Machine interface, dispatch logic
- [`src/lib/pixi/app.ts`](../src/lib/pixi/app.ts) — Integration, event binding, ticker setup
- [`src/lib/pixi/app-helpers.ts`](../src/lib/pixi/app-helpers.ts) — State entry/exit handlers, startDemo
- [`src/lib/pixi/params.ts`](../src/lib/pixi/params.ts) — Timing parameters

---

## Quick Reference

### States

| State | ID | Purpose |
|-------|----|---------|
| **INTRO** | 0 | Boot animation on first load |
| **INTRO_READY** | 1 | Intro complete, waiting for ENTER to proceed |
| **IDLE** | 2 | Ready state, waiting for interaction |
| **BROWSING** | 3 | Navigating verb sets after arrow-key interaction |
| **DEMO** | 4 | Playing verb set animation with scrolling CLI output |
| **POST_DEMO** | 5 | After demo completion, showing action suggestions |
| **BUGGED** | 6 | Easter egg glitch effect (accessed via SHIFT_TAB) |
| **ESC_COUNTDOWN** | 7 | ESC key countdown state |

### Events

| Event | Trigger | Description |
|-------|---------|-------------|
| **ENTER** | Return key or click input area | Advance state |
| **ARROW_DOWN** | Down arrow key | Next option |
| **ARROW_UP** | Up arrow key | Previous option |
| **TAB** | Tab key | Tab-complete suggestion |
| **ESC** | Escape key | Exit current flow |
| **SHIFT_TAB** | Shift+Tab keys | Enter BUGGED easter egg |
| **DEMO_TIMEOUT** | Auto-fired after timeout | Exit DEMO → POST_DEMO |
| **BUGGED_TIMEOUT** | Auto-fired after 8s | Exit BUGGED → previous |

---

## State Descriptions

### INTRO (0)
Boot animation on first page load.

### INTRO_READY (1)
Intro animation complete. **ENTER** → transitions to **IDLE**.

### IDLE (2)
Ready state showing prompt: `"Show me some verbs of [setName]"`.
- **ENTER** → transitions to **DEMO** with selected set
- **ARROW_UP/DOWN** → enters **BROWSING** and cycles sets
- **TAB** → tab-completes current suggestion
- **SHIFT_TAB** → enters **BUGGED**

### BROWSING (3)
Navigating verb sets after arrow-key interaction.
- **ENTER** → transitions to **DEMO** (checks skip counter for "idiot" set)
- **ARROW_DOWN** → increments `skipCount`, cycles sets
- **ARROW_UP** → decrements or returns to **IDLE** if at start
- **TAB** → tab-completes current suggestion
- **SHIFT_TAB** → enters **BUGGED**

### DEMO (4)
Playing verb set animation with scrolling CLI output.
- **DEMO_TIMEOUT** → auto-transition to **POST_DEMO**
- **SHIFT_TAB** → enters **BUGGED**
- ESC is handled by `esc-skip.ts`, not the state machine directly

### POST_DEMO (5)
After demo, showing 3 action suggestions:
1. `"browse sets"` → navigates to marketplace
2. `"copy command"` → copies install command to clipboard
3. `"navigate more demos"` → returns to **IDLE**

- **ARROW_UP/DOWN** → cycles between suggestions
- **ENTER** → executes selected action
- **TAB** → tab-completes
- **SHIFT_TAB** → enters **BUGGED**

### BUGGED (6)
Easter egg glitch state, accessed via **SHIFT_TAB**.
- Applies screen flicker effect
- Stores `machine.previous` for context-preserving exit
- **ESC** or **BUGGED_TIMEOUT** (8s) → returns to previous state

### ESC_COUNTDOWN (7)
Countdown state triggered by ESC key handling.

---

## Special Logic

### Skip Counter ("idiot" set trigger)

Located in `dispatchBrowsing()`:
- Tracks consecutive ARROW_DOWN presses without selection
- When `skipCount >= 4` (SKIP_THRESHOLD): replaces normal set selection with "idiot" set
- **ARROW_UP** resets counter to 3 when triggered
- Counter resets on actual selection (ENTER)

### BUGGED State Reversal

- Stores `machine.previous` before entering BUGGED
- Exits on **ESC** or after **BUGGED_TIMEOUT_MS** (8000ms)
- Returns to exact previous state

### Post-Demo Actions

```typescript
POST_SUGGESTIONS = [
  { text: 'browse sets', action: 'marketplace' },
  { text: 'copy command', action: 'copy' },
  { text: 'navigate more demos', action: 'browse' }
]
```

### Machine Interface

```typescript
interface Machine {
  current: State
  previous: State
  activeSet: VerbSet | null
  browseIndex: number
  skipCount: number
  postIndex: number
  demoTimer: ReturnType<typeof setTimeout> | null
  buggedTimer: ReturnType<typeof setTimeout> | null
  hasSubmitted: boolean
  tabCompleted: boolean
  overlapped: boolean
}
```

---

## Visual Effects

| Effect | File | Description |
|--------|------|-------------|
| **LCD Subpixels** | `effects/lcd.ts` | RGB stripe pattern overlay |
| **Dead Pixels** | `effects/dead-pixels.ts` | Random pixel artifacts |
| **Depth of Field** | `effects/dof.ts` | Depth blur effect |
| **Breathing** | `effects/breathing.ts` | Subtle breathing animation |
| **Flicker** | `effects/flicker.ts` | Screen flicker (chaos mode in BUGGED) |

---

## Critical Files

| File | Purpose |
|------|---------|
| `src/lib/pixi/state-machine.ts` | State enum, Machine interface, dispatch functions |
| `src/lib/pixi/app.ts` | Integration point, event binding, ticker setup |
| `src/lib/pixi/app-helpers.ts` | State entry/exit handlers, startDemo, updateSuggestionUI |
| `src/lib/pixi/params.ts` | Timing parameters |
| `src/lib/pixi/ticker.ts` | Animation loops for spinner, demo, scroll, flicker |
| `src/lib/pixi/intro.ts` | Intro boot animation |
| `src/lib/pixi/esc-skip.ts` | ESC key skip handling |
| `src/lib/pixi/effects/flicker.ts` | BUGGED state visual effect |
| `src/lib/pixi/effects/lcd.ts` | LCD subpixel pattern overlay |
| `src/lib/pixi/effects/dead-pixels.ts` | Dead pixel artifacts |
| `src/lib/pixi/effects/dof.ts` | Depth of field effect |
| `src/lib/pixi/effects/breathing.ts` | Breathing animation |
