import type { VerbSet, VerbSets } from '$lib/data/types'
import { type Application, Container, Text, Texture } from 'pixi.js'
import { FONT_FAMILY, PALETTE } from './constants'
import { buildDeadPixelLayers } from './effects/dead-pixels'
import { buildGlareCanvas } from './effects/glare'
import { buildHeaderRows } from './header'
import { hexToNum, normalizeVerbs, shuffle } from './helpers'
import type { LayoutCtx } from './layout'
import type { Params } from './params'
import type { SceneRefs } from './scene'
import { type Machine, POST_SUGGESTIONS, SKIP_THRESHOLD, State, stateName } from './state-machine'
import type { TextPool } from './text-pool'
import type { TickerState } from './ticker'

export function exitCurrentState(machine: Machine): void {
  if (machine.current === State.DEMO && machine.demoTimer) {
    clearTimeout(machine.demoTimer)
    machine.demoTimer = null
  }
}

export function applyStateEntry(
  state: State,
  machine: Machine,
  updateSuggestion: () => void,
  startDemo: (set: VerbSet | null) => void,
): void {
  machine.tabCompleted = false
  const showsSuggestion =
    state === State.IDLE || state === State.BROWSING || state === State.POST_DEMO
  if (showsSuggestion) updateSuggestion()
  if (state === State.DEMO) startDemo(machine.activeSet)
}

function updateIdleSuggestion(
  machine: Machine,
  localeSets: VerbSet[],
  s: SceneRefs,
  ts: TickerState,
): void {
  const idleSet = localeSets.length > 0 ? localeSets[machine.browseIndex % localeSets.length] : null
  const label = idleSet ? `Show me some verbs of ${idleSet.name}` : 'No sets available'
  const hint =
    idleSet && !machine.tabCompleted
      ? '   \u2191\u2193 browse \u00b7 enter to demo \u00b7 \u00b7 tab to complete'
      : ''
  s.promptText.text = `\u276f ${label}${hint}`
  s.promptText.style.fill = machine.tabCompleted ? PALETTE.active : PALETTE.suggestion
  s.statusText.text = `\u2026/claude-verbs-website   main *5   [${stateName(machine.current)}]`
  s.permsText.text =
    '\u23f5\u23f5 bypass permissions on (shift+tab to cycle) \u00b7 5 files +322 -66'
  s.infoText.text = '00:00 | tip: /git:commit'
  ts.layoutDirty = true
}

function getBrowsingText(
  machine: Machine,
  localeSets: VerbSet[],
  idiotSet: VerbSet | null,
): string {
  if (machine.skipCount >= SKIP_THRESHOLD && idiotSet) return 'Show me some verbs of an idt'
  const name = localeSets[machine.browseIndex % localeSets.length]?.name
  return name ? `Show me some verbs of ${name}` : ''
}

function updateActiveSuggestion(
  machine: Machine,
  localeSets: VerbSet[],
  idiotSet: VerbSet | null,
  s: SceneRefs,
  ts: TickerState,
): void {
  let text = ''
  let hint = ''
  if (machine.current === State.BROWSING) {
    text = getBrowsingText(machine, localeSets, idiotSet)
    if (!machine.tabCompleted)
      hint = '\u2191\u2193 browse \u00b7 enter to demo \u00b7 \u00b7 tab to complete'
  } else if (machine.current === State.POST_DEMO) {
    text = POST_SUGGESTIONS[machine.postIndex].text
    if (!machine.tabCompleted)
      hint = '\u2191\u2193 browse \u00b7 enter to select \u00b7 \u00b7 tab to complete'
  }
  s.promptText.text = hint ? `\u276f ${text}   ${hint}` : `\u276f ${text}`
  s.promptText.style.fill = PALETTE.active
  s.verbText.text = ''
  s.ellipsisText.visible = false
  s.highlightText.visible = false
  ts.layoutDirty = true
}

export function updateSuggestionUI(
  machine: Machine,
  localeSets: VerbSet[],
  idiotSet: VerbSet | null,
  s: SceneRefs,
  ts: TickerState,
): void {
  if (machine.current === State.IDLE) updateIdleSuggestion(machine, localeSets, s, ts)
  else updateActiveSuggestion(machine, localeSets, idiotSet, s, ts)
}

export function resetDemoState(
  set: VerbSet,
  ts: TickerState,
  s: SceneRefs,
  params: Params,
  scrollItems: (Text | Container)[],
  pool: TextPool,
): void {
  const sv = set.verbs ? normalizeVerbs(set.verbs) : []
  ts.verbs = shuffle(sv)
  if (ts.verbs.length === 0) ts.verbs = ['Thinking', 'Processing']
  ts.verbIdx = 0
  s.verbText.text = ts.verbs[0]
  s.verbText.style.fill = hexToNum(params.colorVerb)
  s.ellipsisText.visible = true
  s.promptText.text = '\u276f'
  s.promptText.style.fill = PALETTE.prompt
  ts.tokenCount = 0
  ts.startTime = Date.now()
  ts.lastFrameTime = 0
  ts.lastVerbTime = 0
  ts.lastTokenTime = 0
  ts.lastScrollTime = 0
  for (let i = scrollItems.length - 1; i >= 0; i--) {
    s.scrollContainer.removeChild(scrollItems[i])
    if ('style' in scrollItems[i]) pool.release(scrollItems[i] as Text)
  }
  scrollItems.length = 0
  ts.layoutDirty = true
}

export function handleResize(
  app: Application,
  s: SceneRefs,
  params: Params,
  updateCamera: () => void,
): void {
  const w = app.screen.width
  const h = app.screen.height
  const rtW = s.displayRT.width
  const rtH = s.displayRT.height
  const dpLayers = buildDeadPixelLayers(rtW, rtH, params.deadPixelsEnabled)
  s.deadPixelSprite.texture.destroy(true)
  s.deadPixelSprite.texture = Texture.from({ resource: dpLayers.dark, scaleMode: 'nearest' })
  s.deadPixelSprite.width = rtW
  s.deadPixelSprite.height = rtH
  s.stuckPixelSprite.texture.destroy(true)
  s.stuckPixelSprite.texture = Texture.from({ resource: dpLayers.stuck, scaleMode: 'nearest' })
  s.stuckPixelSprite.width = rtW
  s.stuckPixelSprite.height = rtH
  const gc = buildGlareCanvas(w, h)
  s.glareSprite.texture.destroy(true)
  s.glareSprite.texture = Texture.from({ resource: gc, scaleMode: 'nearest' })
  s.glareSprite.x = w - s.glareSprite.texture.width * 0.4
  s.glareSprite.y = -h * 0.1
  updateCamera()
}

export function initHeader(
  sets: VerbSets,
  params: Params,
  s: SceneRefs,
  lctx: LayoutCtx,
  scrollItems: (Text | Container)[],
): void {
  const headerRows = buildHeaderRows(80, sets, params)
  for (const hr of headerRows) {
    const rowContainer = new Container()
    rowContainer.x = Math.round(lctx.chW)
    let xOff = 0
    for (const part of hr.parts) {
      const pt = new Text({
        text: part.text,
        style: { fontFamily: FONT_FAMILY, fontSize: params.fontSize, fill: part.color },
      })
      pt.x = xOff
      xOff += pt.width
      rowContainer.addChild(pt)
    }
    s.scrollContainer.addChild(rowContainer)
    scrollItems.push(rowContainer)
  }
}
