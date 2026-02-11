# PixiJS Home Page: State Machine Architecture

## Overview

The interactive CRT terminal animation on the home page (`src/routes/+page.svelte`) is controlled by a finite state machine that guides users through browsing and demonstrating verb sets. This document provides a complete reference for understanding the state transitions, special logic, and visual effects.

**Core implementation:**
- [`src/lib/pixi/state-machine.ts`](../src/lib/pixi/state-machine.ts) — State enum, Machine interface, dispatch logic
- [`src/lib/pixi/app.ts`](../src/lib/pixi/app.ts) — Integration, event binding, ticker setup
- [`src/lib/pixi/params.ts`](../src/lib/pixi/params.ts) — Timing parameters

---

## Quick Reference

### States

| State | ID | Purpose |
|-------|----|---------|
| **IDLE** | 0 | Initial state, waiting for ENTER to start demo |
| **BROWSING** | 1 | Navigating verb sets after first arrow-key interaction |
| **DEMO** | 2 | Playing verb set animation with scrolling CLI output |
| **POST_DEMO** | 3 | After demo completion, showing action suggestions |
| **BUGGED** | 4 | Easter egg glitch effect (accessed via SHIFT_TAB) |

### Events

| Event | Trigger | Description |
|-------|---------|-------------|
| **ENTER** | Return key or click input area | Advance state (IDLE→DEMO, POST_DEMO→action) |
| **ARROW_DOWN** | Down arrow key | Next option (browse sets, cycle suggestions) |
| **ARROW_UP** | Up arrow key | Previous option (browse sets, cycle suggestions) |
| **ESC** | Escape key | Exit current flow (DEMO→POST_DEMO, BUGGED→previous) |
| **SHIFT_TAB** | Shift+Tab keys | Enter BUGGED easter egg (from any interactive state) |
| **DEMO_TIMEOUT** | Auto-fired after 60s | Exit DEMO → POST_DEMO (timeout mechanism) |

### Key Parameters

```typescript
frameMs: 500        // Spinner glyph rotation speed (ms)
verbMs: 4500        // Verb rotation interval (ms)
scrollMs: 350       // Scroll line speed (ms)
demoTimeoutMs: 60000 // Auto-exit demo after 60 seconds
```

---

## ASCII State Diagram

```
                    ┌─────────────┐
              ┌────▶│   IDLE (0)  │◀──── Start
              │     └──────┬──────┘
              │            │ ENTER
              │            ▼
              │     ┌─────────────┐
              │     │  DEMO (2)   │
              │     └──────┬──────┘
              │       ESC  │  DEMO_TIMEOUT (60s)
              │            ▼
        ESC   │     ┌─────────────┐
     ┌────────┴────▶│POST_DEMO (3)│
     │              └──────┬──────┘
     │                     │ ENTER (action)
     │                     ├─ copy command
     │                     └─ navigate marketplace
     │
     │              ╔═════════════╗
     └──────────────║ BUGGED (4) ║◀──── SHIFT_TAB from any state
       ESC to       ╚═════════════╝      (easter egg)
     previous

Notes:
  • Arrow navigation enters BROWSING before demo selection
  • All interactive states can transition to BUGGED via SHIFT_TAB
  • BUGGED uses double-line box to indicate special/easter egg status
```

---

## State Descriptions

### IDLE (0)
**Initial state on page load**

- Displays prompt: `"Show me some verbs of [setName]"`
- **ENTER** → transitions to **DEMO** with selected set
- **ARROW_UP/DOWN** → cycles through available locale sets
- Shows interactive hint: `"press enter"`

**Skip counter logic:** If user presses ARROW_DOWN ≥4 times without selecting (in BROWSING flow), triggers "idiot" set selection on next ENTER.

### BROWSING (1)
**Reserved state for multi-step browsing**

- Defined in state enum but not actively transitioned to in current implementation
- Contains similar navigation logic to IDLE (ARROW_UP/DOWN cycling)
- Shares skip counter logic for "idiot" set easter egg trigger
- Future extension point for more complex browsing flows

### DEMO (2)
**Playing verb set animation**

- Displays animated verb conjugation with scrolling CLI output
- Visual effects: verb rotation (4.5s interval), highlight animation, token counter, scrolling lines
- **ESC** → interrupt demo, transition to **POST_DEMO**
- **DEMO_TIMEOUT** → auto-transition to **POST_DEMO** after 60 seconds
- Shows hint: `"esc to interrupt"`
- Timer cleared on exit to prevent memory leaks

**Animation details:**
- Verbs rotate every `verbMs` (4500ms)
- New scroll lines appear every `scrollMs` (350ms)
- Spinner glyph rotates every `frameMs` (100ms)

### POST_DEMO (3)
**After demo, showing suggestions**

Displays 2 action suggestions:
1. `"copy command to get access to spinner verb cli"` → copies `bunx github:doublej/claude-verbs-cli install [name]` to clipboard
2. `"show marketplace"` → navigates to `/marketplace` page

- **ARROW_UP/DOWN** → cycles between suggestions
- **ENTER** → executes selected action (stays in POST_DEMO state)
- Shows hint: `"↑↓ browse · enter to select"`

### BUGGED (4)
**Easter egg glitch state**

- Accessed via **SHIFT_TAB** from any interactive state (not part of normal flow)
- Applies screen flicker effect (`flicker.mode = 0`)
- Stores `machine.previous` to enable return on ESC
- Visual: vertical offset jitter + alpha modulation (chaos flicker mode)
- **ESC** → returns to exact previous state (not always IDLE)

---

## Transition Matrix

| Current State | Event | Next State | Side Effects |
|---------------|-------|-----------|--------------|
| **IDLE** | ENTER | DEMO | Set `activeSet`, `hasSubmitted=true` |
| | ARROW_DOWN | BROWSING | Increment `browseIndex`, reset `skipCount`, start browse mode |
| | ARROW_UP | BROWSING | Decrement `browseIndex`, reset `skipCount`, start browse mode |
| | SHIFT_TAB | BUGGED | Enable flicker effect, store previous state |
| **BROWSING** | ENTER | DEMO | Check `skipCount ≥4` → use idiotSet, else selected set |
| | ARROW_DOWN | BROWSING | Increment `skipCount`, cycle sets (unless idiot triggered) |
| | ARROW_UP | BROWSING or IDLE | Decrement `skipCount` or return to IDLE if at start |
| | SHIFT_TAB | BUGGED | Enable flicker effect, store previous state |
| **DEMO** | ESC | POST_DEMO | Clear `demoTimer`, reset `postIndex` to 0 |
| | DEMO_TIMEOUT | POST_DEMO | Auto-transition after 60s |
| | SHIFT_TAB | BUGGED | Enable flicker effect, store previous state |
| **POST_DEMO** | ENTER | POST_DEMO | Execute action (copy/navigate), stay in state |
| | ARROW_DOWN | POST_DEMO | Increment `postIndex` (wrap to 0) |
| | ARROW_UP | POST_DEMO | Decrement `postIndex` (wrap to 1) |
| | SHIFT_TAB | BUGGED | Enable flicker effect, store previous state |
| **BUGGED** | ESC | (previous) | Return to `machine.previous` state |

---

## Special Logic

### Skip Counter ("idiot" set trigger)

Located in `dispatchBrowsing()`:

- Tracks consecutive ARROW_DOWN presses without selection
- When `skipCount >= 4`: replaces normal set selection with "idiot" set (if available in `en` locale)
- **ARROW_UP** resets counter to 3 when triggered, allowing escape
- Counter resets on actual selection (ENTER)
- Prevents user from browsing other sets once triggered

**Purpose:** Easter egg for users rapidly skipping through sets without engaging.

### DEMO Auto-Timeout

Timer mechanism to prevent infinite demo state:

- Timer set when entering DEMO: `setTimeout(() => dispatch('DEMO_TIMEOUT'), demoTimeoutMs)`
- Fires after `demoTimeoutMs` (60000ms / 60 seconds)
- Cleared on ESC or state exit via `exitCurrentState()` to prevent memory leaks
- Ensures graceful fallback if user leaves browser tab

### BUGGED State Reversal

Context-preserving easter egg exit:

- Stores `machine.previous` before entering BUGGED
- **ESC** returns to exact previous state (could be IDLE, DEMO, or POST_DEMO)
- Allows escape from glitch effect without losing interaction context
- Only accessible via **SHIFT_TAB** (hidden feature, not documented in UI)

### Post-Demo Actions

```typescript
POST_SUGGESTIONS = [
  { text: 'copy command to get access to spinner verb cli', action: 'copy' },
  { text: 'show marketplace', action: 'marketplace' }
]
```

**Action handlers:**
- `copy`: uses `navigator.clipboard.writeText()` to copy `bunx github:doublej/claude-verbs-cli install [name]`
- `marketplace`: navigates via `window.location.href = '/marketplace'`

Both actions execute immediately on ENTER but keep state at POST_DEMO (allows multiple copies or retries).

---

## Visual Effects by State

| State | Text Elements | Visual Effects | UI Hints |
|-------|--------------|----------------|----------|
| **IDLE** | Prompt, suggestion, spinner | LCD subpixels, dead pixels, glare | `"press enter"` |
| **DEMO** | Verb text, highlight, ellipsis, meta, scroll lines | Verb rotation (4.5s), highlight animation, token counter, scrolling output | `"esc to interrupt"` |
| **POST_DEMO** | Suggestion text (2 options), meta | None (static display) | `"↑↓ browse · enter to select"` |
| **BUGGED** | All visible text | Screen flicker (vertical offset, alpha jitter) | None |

### Effect Details

**LCD Subpixels** (`effects/lcd.ts`):
- RGB stripe pattern overlay simulating LCD subpixel structure
- Applied to entire display via filter
- Toggleable via `params.lcdEnabled`

**Dead Pixels** (`effects/dead-pixels.ts`):
- Random pixel artifacts for CRT authenticity
- Sprite overlay on display
- Toggleable via `params.deadPixelsEnabled`

**Glare** (`effects/glare.ts`):
- Radial gradient highlight simulating screen reflection
- Opacity controlled by `params.glareOpacity` (default: 0)

**Flicker** (`effects/flicker.ts`):
- **Chaos mode** (BUGGED state): vertical offset jitter + alpha modulation
- Y-offset range: `params.flickerMaxYLines` (4 lines)
- Alpha range: `params.flickerGhostAlphaMin` to 1.0
- Triggered by `flicker.mode = 0` in BUGGED state entry

---

## Callbacks & Integration

### State Machine Interface

```typescript
interface Callbacks {
  enterState: (state: State) => void
  updateSuggestion: () => void
}
```

Callbacks passed to `dispatch()` allow state machine to trigger UI updates without coupling to PixiJS scene.

### `enterState(state)`

Located in `app.ts:130-138`:

1. Calls `exitCurrentState(machine)` — cleanup previous state (clear timers)
2. Stores current state: `machine.previous = machine.current`
3. Updates current: `machine.current = state`
4. Resets state-specific indices (e.g., `postIndex = 0` for POST_DEMO)
5. Applies state effects (e.g., `flicker.mode = 0` for BUGGED)
6. Calls `applyStateEntry(state, ...)` for state-specific setup
7. Marks layout as dirty: `ts.layoutDirty = true`

### `applyStateEntry(state)`

Located in `app-helpers.ts`:

**State-specific setup:**
- **IDLE/BROWSING/POST_DEMO**: Update suggestion text via `updateSuggestionUI()`
- **DEMO**: Call `startDemo()` — shuffles verbs, resets animation state, sets `demoTimer`
- **BUGGED**: Already handled in `enterState()` (`flicker.mode = 0`)

### `updateSuggestion()`

Located in `app.ts:118-120`:

- Wrapper for `updateSuggestionUI()` in `app-helpers.ts`
- Updates suggestion text based on `machine.browseIndex` or `machine.postIndex`
- Handles skip counter display ("idiot" set warning in BROWSING)
- Called after navigation events (ARROW_UP/DOWN)

### Ticker Integration

Located in `ticker.ts`, runs at ~60 FPS via `app.ticker.add()`:

**Per-frame updates:**
- `tickSpinner()`: Updates spinner glyph every `frameMs` (100ms)
- `tickDemo()`: Rotates verbs every `verbMs` (4.5s), increments token counter (only in DEMO/BUGGED)
- `tickScroll()`: Adds new scroll lines every `scrollMs` (350ms) if in DEMO state
- `tickFlicker()`: Applies flicker Y-offset + alpha modulation if in BUGGED state
- `tickLayout()`: Recomputes text layout when `ts.layoutDirty` is set

**State-aware logic:**
```typescript
// Only tick demo animation in DEMO or BUGGED states
if (machine.current === State.DEMO || machine.current === State.BUGGED)
  tickDemo(now, ts, s, params, lctx)
```

---

## Critical Files

| File | Purpose |
|------|---------|
| `src/lib/pixi/state-machine.ts` | State enum, Machine interface, dispatch functions |
| `src/lib/pixi/app.ts` | Integration point, event binding, ticker setup |
| `src/lib/pixi/app-helpers.ts` | State entry/exit handlers, `startDemo()`, `updateSuggestionUI()` |
| `src/lib/pixi/params.ts` | Timing parameters (demoTimeoutMs, verbMs, scrollMs, frameMs) |
| `src/lib/pixi/ticker.ts` | Animation loops for spinner, demo, scroll, flicker |
| `src/lib/pixi/effects/flicker.ts` | BUGGED state visual effect (chaos mode) |
| `src/lib/pixi/effects/lcd.ts` | LCD subpixel pattern overlay |
| `src/lib/pixi/effects/dead-pixels.ts` | Dead pixel artifacts |
| `src/lib/pixi/effects/glare.ts` | Radial gradient glare |

---

## Event Binding

**Keyboard events** (`app.ts:163-173`):

```typescript
const KEY_MAP: Record<string, DispatchEvent> = {
  Enter: 'ENTER',
  ArrowDown: 'ARROW_DOWN',
  ArrowUp: 'ARROW_UP',
  Escape: 'ESC',
}
```

**Special cases:**
- `Tab + Shift` → `SHIFT_TAB` (manual handling)
- `` ` `` (backtick) → toggles Tweakpane devtools (localhost only)

**Pointer events** (`app.ts:175-180`):
- Click on `inputContainer` → `ENTER`
- Click on `promptText` → `ENTER` (only in IDLE state)

---

## Architecture Notes

### State Machine Purity

The state machine (`state-machine.ts`) is **pure logic**:
- No direct PixiJS dependencies
- No side effects (callbacks handle all mutations)
- Easily testable in isolation
- All side effects delegated to callbacks

### Separation of Concerns

**State machine** (`state-machine.ts`):
- State transitions and event routing
- Skip counter logic
- Post-demo action dispatch

**Scene management** (`app.ts`, `app-helpers.ts`):
- PixiJS scene updates
- Timer management
- Visual effect triggers

**Animation** (`ticker.ts`):
- Frame-by-frame updates
- Time-based state queries
- Text pool management

### Extension Points

**Adding new states:**
1. Add to `State` enum in `state-machine.ts`
2. Add dispatch case in `dispatch()` function
3. Add entry logic in `applyStateEntry()` in `app-helpers.ts`
4. Update ticker conditions if animation needed

**Adding new events:**
1. Add to `DispatchEvent` type in `state-machine.ts`
2. Add key mapping in `KEY_MAP` in `app.ts` (if keyboard event)
3. Add dispatch handling in relevant state functions

---

## Debugging Tips

**State inspection:**

```javascript
// In browser console (localhost only)
window.__spinnerAPI.app.ticker.add(() => {
  console.log(machine.current, machine.browseIndex)
})
```

**Trigger events manually:**

```javascript
// Force state transition
doDispatch('SHIFT_TAB')  // Enter BUGGED
doDispatch('ESC')        // Exit to previous
```

**Check timer state:**

```javascript
// Verify demo timer is set
console.log(machine.demoTimer !== null)  // Should be true in DEMO state
```

**Tweakpane devtools** (localhost only):
- Press `` ` `` (backtick) to open parameter panel
- Adjust `demoTimeoutMs`, `verbMs`, `scrollMs` live
- Toggle visual effects (`lcdEnabled`, `deadPixelsEnabled`)

---

## Future Enhancements

**Potential improvements:**
- Refine BROWSING transitions for alternate input devices
- Add DEMO pause/resume (space bar)
- Multi-language voice hints
- More easter eggs (konami code?)
- State persistence across page refreshes
- Analytics tracking for state transitions

**Breaking changes to avoid:**
- Removing BROWSING state (reserved for future use)
- Changing POST_SUGGESTIONS order (may break user muscle memory)
- Removing ESC from BUGGED (only documented exit path)
