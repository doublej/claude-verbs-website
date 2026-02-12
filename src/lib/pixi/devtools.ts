import type { Graphics } from 'pixi.js'
import type { DofFilter } from './effects/dof'
import { updateDofUniforms } from './effects/dof'
import type { Params } from './params'

type BindOpts = Record<string, unknown>

export async function initDevtools(
  params: Params,
  dofFilter: DofFilter,
  markDirty: () => void,
  focusCrosshair?: Graphics,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tweakpane types need @tweakpane/core
  const { Pane } = (await import('tweakpane')) as any
  const pane = new Pane({ title: 'Claude Verbs' }) as any
  const root = pane.element.parentElement as HTMLElement
  if (root) root.style.width = '512px'

  function bind(folder: any, key: keyof Params, opts?: BindOpts) {
    folder.addBinding(params, key, opts || {}).on('change', markDirty)
  }

  const fT = pane.addFolder({ title: 'Timing', expanded: true })
  bind(fT, 'frameMs', { min: 30, max: 500, step: 10 })
  bind(fT, 'verbMs', { min: 500, max: 10000, step: 100 })
  bind(fT, 'scrollMs', { min: 50, max: 2000, step: 50 })
  bind(fT, 'demoTimeoutMs', { min: 5000, max: 60000, step: 1000 })
  bind(fT, 'charDwellMs', { min: 50, max: 1000, step: 50 })
  bind(fT, 'tokenRate', { min: 5, max: 200, step: 5 })

  const fC = pane.addFolder({ title: 'Colors', expanded: true })
  bind(fC, 'colorVerb')
  bind(fC, 'colorVerbHighlight')
  bind(fC, 'colorEllipsis')
  bind(fC, 'bgColor')
  bind(fC, 'colorHighlight')

  const fCam = pane.addFolder({ title: 'Camera', expanded: true })
  bind(fCam, 'perspective', { min: 200, max: 5000, step: 50 })
  bind(fCam, 'scale', { min: 0.5, max: 3, step: 0.05 })
  bind(fCam, 'zoom', { min: 0.1, max: 5, step: 0.1 })
  bind(fCam, 'translateX', { min: -50, max: 50, step: 1 })
  bind(fCam, 'translateY', { min: -50, max: 50, step: 1 })
  bind(fCam, 'originX', { min: 0, max: 100, step: 1 })
  bind(fCam, 'originY', { min: 0, max: 100, step: 1 })
  bind(fCam, 'rotateX', { min: -45, max: 45, step: 0.5 })
  bind(fCam, 'rotateY', { min: -45, max: 45, step: 0.5 })
  bind(fCam, 'rotateZ', { min: -45, max: 45, step: 0.5 })
  bind(fCam, 'focusTargetX', { min: 0, max: 2000, step: 10 })
  bind(fCam, 'focusTargetY', { min: 0, max: 2000, step: 10 })
  bind(fCam, 'focusStrength', { min: 0, max: 1, step: 0.1 })
  if (focusCrosshair) {
    const toggle = { showFocusTarget: focusCrosshair.visible }
    fCam.addBinding(toggle, 'showFocusTarget').on('change', (ev: { value: boolean }) => {
      focusCrosshair.visible = ev.value
      markDirty()
    })
  }

  const fR = pane.addFolder({ title: 'Display', expanded: true })
  bind(fR, 'displayDownscale', { min: 0.5, max: 8, step: 0.5 })
  bind(fR, 'imageRendering', { options: { Pixelated: 'pixelated', Auto: 'auto' } })

  const fTx = pane.addFolder({ title: 'Text', expanded: true })
  bind(fTx, 'fontSize', { min: 16, max: 120, step: 2 })
  bind(fTx, 'lineHeightOffset', { min: -20, max: 40, step: 1 })

  const fPos = pane.addFolder({ title: 'Position', expanded: true })
  bind(fPos, 'offsetX', { min: -40, max: 40, step: 1 })
  bind(fPos, 'offsetY', { min: -40, max: 40, step: 1 })
  bind(fPos, 'absoluteX', { min: 0, max: 200, step: 1 })
  bind(fPos, 'absoluteY', { min: 0, max: 100, step: 1 })

  const fFx = pane.addFolder({ title: 'Effects', expanded: true })
  bind(fFx, 'lcdEnabled')
  bind(fFx, 'deadPixelsEnabled')
  bind(fFx, 'bloomEnabled')
  bind(fFx, 'bloomStrength', { min: 0, max: 20, step: 0.5 })
  bind(fFx, 'bloomQuality', { min: 1, max: 10, step: 1 })
  bind(fFx, 'brightness', { min: 0, max: 3, step: 0.05 })
  bind(fFx, 'saturation', { min: 0, max: 3, step: 0.05 })
  bind(fFx, 'exposure', { min: 0, max: 3, step: 0.05 })

  const fDof = pane.addFolder({ title: 'Depth of Field', expanded: true })
  fDof
    .addBinding(dofFilter, '_strength', { label: 'strength', min: 0, max: 1, step: 0.01 })
    .on('change', () => {
      dofFilter.enabled = dofFilter._strength > 0.01
      updateDofUniforms(dofFilter)
    })
  fDof
    .addBinding(dofFilter, '_maxRadius', { label: 'maxRadius', min: 1, max: 30, step: 1 })
    .on('change', () => updateDofUniforms(dofFilter))
  fDof
    .addBinding(dofFilter, '_falloffStart', { label: 'falloffStart', min: 0, max: 1, step: 0.01 })
    .on('change', () => updateDofUniforms(dofFilter))
  fDof
    .addBinding(dofFilter, '_directionAngle', {
      label: 'direction',
      min: 0,
      max: 360,
      step: 15,
      format: (v: number) => `${v}°`,
    })
    .on('change', () => updateDofUniforms(dofFilter))

  const fFl = pane.addFolder({ title: 'Flicker', expanded: true })
  bind(fFl, 'flickerNormalPct', { min: 0, max: 80, step: 5 })
  bind(fFl, 'flickerMaxYLines', { min: 1, max: 10, step: 1 })
  bind(fFl, 'flickerGhostAlphaMin', { min: 0, max: 0.8, step: 0.05 })

  pane.addButton({ title: 'Export JSON' }).on('click', () => {
    const json = JSON.stringify(params, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'spinner-params.json'
    a.click()
    URL.revokeObjectURL(a.href)
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === '`') pane.hidden = !pane.hidden
  })
}
