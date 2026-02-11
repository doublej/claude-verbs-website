import { CAMERA_DEFAULTS } from './constants'
import type { Params } from './params'

export const GRID_DIVISIONS = CAMERA_DEFAULTS.gridDivisions
const GRID_VERTS = (GRID_DIVISIONS + 1) * (GRID_DIVISIONS + 1)

export function createMeshGeometry(
  w: number,
  h: number,
  padding = 0,
): {
  vertices: Float32Array
  uvs: Float32Array
  indices: Uint32Array
} {
  const padW = w * padding
  const padH = h * padding
  const vertices = new Float32Array(GRID_VERTS * 2)
  const uvs = new Float32Array(GRID_VERTS * 2)
  const indices = new Uint32Array(GRID_DIVISIONS * GRID_DIVISIONS * 6)

  let vIdx = 0
  for (let row = 0; row <= GRID_DIVISIONS; row++) {
    const v = row / GRID_DIVISIONS
    const y = -padH + v * (h + 2 * padH)
    for (let col = 0; col <= GRID_DIVISIONS; col++) {
      const u = col / GRID_DIVISIONS
      const x = -padW + u * (w + 2 * padW)
      vertices[vIdx * 2] = x
      vertices[vIdx * 2 + 1] = y
      uvs[vIdx * 2] = u
      uvs[vIdx * 2 + 1] = v
      vIdx++
    }
  }

  let iIdx = 0
  for (let row = 0; row < GRID_DIVISIONS; row++) {
    for (let col = 0; col < GRID_DIVISIONS; col++) {
      const tl = row * (GRID_DIVISIONS + 1) + col
      const tr = tl + 1
      const bl = tl + (GRID_DIVISIONS + 1)
      const br = bl + 1
      indices[iIdx++] = tl
      indices[iIdx++] = tr
      indices[iIdx++] = br
      indices[iIdx++] = tl
      indices[iIdx++] = br
      indices[iIdx++] = bl
    }
  }

  return { vertices, uvs, indices }
}

export function computeCameraVertices(
  w: number,
  h: number,
  p: Params,
  baseVerts: Float32Array,
  out: Float32Array,
): void {
  const ox = (p.originX / 100) * w
  const oy = (p.originY / 100) * h
  const tx = ((p.translateX + p.mouseTranslateX) / 100) * w
  const focusOffset = p.focusTargetY > 0 ? (h / 2 - p.focusTargetY) * p.focusStrength : 0
  const ty = ((p.translateY + p.mouseTranslateY) / 100) * h + focusOffset
  const rz = (p.rotateZ * Math.PI) / 180
  const ry = (p.rotateY * Math.PI) / 180
  const rx = (p.rotateX * Math.PI) / 180
  const crz = Math.cos(rz)
  const srz = Math.sin(rz)
  const cry = Math.cos(ry)
  const sry = Math.sin(ry)
  const crx = Math.cos(rx)
  const srx = Math.sin(rx)
  const z = p.zoom * p.mouseZoom

  for (let i = 0; i < GRID_VERTS; i++) {
    let x = baseVerts[i * 2] - ox
    let y = baseVerts[i * 2 + 1] - oy
    let z0 = 0
    x += tx
    y += ty
    x *= p.scale * z
    y *= p.scale * z
    let x1 = x * crz - y * srz
    const y1 = x * srz + y * crz
    x = x1
    y = y1
    x1 = x * cry + z0 * sry
    const z2 = -x * sry + z0 * cry
    x = x1
    z0 = z2
    const y3 = y * crx - z0 * srx
    const z3 = y * srx + z0 * crx
    y = y3
    z0 = z3
    const f = p.perspective > 0 ? p.perspective / (p.perspective - z0) : 1
    out[i * 2] = x * f + ox
    out[i * 2 + 1] = y * f + oy
  }
}

export function applyCamera(
  w: number,
  h: number,
  params: Params,
  baseVerts: Float32Array,
  verts: Float32Array,
  updateBuffer: () => void,
): void {
  computeCameraVertices(w, h, params, baseVerts, verts)
  updateBuffer()
}
