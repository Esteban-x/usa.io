import { BufferGeometry, Float32BufferAttribute, ShapeUtils, Vector2, Vector3 } from 'three'
import type { StateShape } from '@/app/lib/types'

export const GLOBE_RADIUS = 100
/** Thickness of the extruded state tiles */
export const TILE_HEIGHT = 1.6

const DEG = Math.PI / 180

/** lat/lon (degrees) → point on a sphere of radius r */
export function toVec3(lat: number, lon: number, r: number, target = new Vector3()) {
  const phi = (90 - lat) * DEG
  const theta = (lon + 180) * DEG
  return target.set(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

type P = [number, number] // [lon, lat]

/** Max triangle edge (degrees) before subdividing, so big tiles follow the curvature */
const MAX_EDGE = 1.5

function subdivide(a: P, b: P, c: P, out: P[]) {
  const d = (p: P, q: P) => Math.hypot(p[0] - q[0], p[1] - q[1])
  if (Math.max(d(a, b), d(b, c), d(c, a)) <= MAX_EDGE) {
    out.push(a, b, c)
    return
  }
  const ab: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const bc: P = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]
  const ca: P = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2]
  subdivide(a, ab, ca, out)
  subdivide(ab, b, bc, out)
  subdivide(ca, bc, c, out)
  subdivide(ab, bc, ca, out)
}

const openRing = (ring: P[]) => {
  const r = ring.slice()
  const [f, l] = [r[0], r[r.length - 1]]
  if (r.length > 1 && f[0] === l[0] && f[1] === l[1]) r.pop()
  return r
}

export interface StateGeometry {
  top: BufferGeometry
  walls: BufferGeometry
  outline: BufferGeometry
  /** Width / height of the tile's bounding box (to fit the flag) */
  aspect: number
  /** Visual centre (lat, lon) of the largest polygon */
  centroid: [number, number]
}

export function buildStateGeometry(shape: StateShape): StateGeometry {
  const R = GLOBE_RADIUS
  const top = R + TILE_HEIGHT

  // The flag is fitted on the largest polygon (e.g. mainland Michigan, Hawaii's Big Island…)
  const area = (ring: P[]) => {
    let a = 0
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1])
    return Math.abs(a / 2)
  }
  const polys = shape.polygons as P[][][]
  const main = polys.reduce((m, p) => (area(p[0]) > area(m[0]) ? p : m), polys[0])
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of main[0]) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  const lat0 = (minY + maxY) / 2
  const k = Math.cos(lat0 * DEG) // longitude shrink factor
  const w = (maxX - minX) * k
  const h = maxY - minY
  const uvOf = (x: number, y: number): [number, number] => [
    0.5 + ((x - (minX + maxX) / 2) * k) / w,
    0.5 + (y - (minY + maxY) / 2) / h,
  ]

  const topPos: number[] = []
  const topNorm: number[] = []
  const topUv: number[] = []
  const wallPos: number[] = []
  const linePos: number[] = []
  const v = new Vector3()
  const v2 = new Vector3()

  for (const poly of polys) {
    const rings = poly.map(openRing).filter((r) => r.length >= 3)
    if (!rings.length) continue
    const [outer, ...holes] = rings
    const contour = outer.map(([x, y]) => new Vector2(x, y))
    const holeVecs = holes.map((hr) => hr.map(([x, y]) => new Vector2(x, y)))
    const all: P[] = [...outer, ...holes.flat()]
    const tris = ShapeUtils.triangulateShape(contour, holeVecs)

    const flat: P[] = []
    for (const [a, b, c] of tris) subdivide(all[a], all[b], all[c], flat)
    // Tiles are rendered double-sided, so triangle winding does not matter
    for (const [x, y] of flat) {
      toVec3(y, x, top, v)
      topPos.push(v.x, v.y, v.z)
      v.normalize()
      topNorm.push(v.x, v.y, v.z)
      topUv.push(...uvOf(x, y))
    }

    for (const ring of rings) {
      for (let i = 0; i < ring.length; i++) {
        const [ax, ay] = ring[i]
        const [bx, by] = ring[(i + 1) % ring.length]
        const a0 = toVec3(ay, ax, R).toArray()
        const b0 = toVec3(by, bx, R).toArray()
        const a1 = toVec3(ay, ax, top).toArray()
        const b1 = toVec3(by, bx, top).toArray()
        wallPos.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1)
        toVec3(ay, ax, top + 0.02, v)
        toVec3(by, bx, top + 0.02, v2)
        linePos.push(v.x, v.y, v.z, v2.x, v2.y, v2.z)
      }
    }
  }

  const topGeo = new BufferGeometry()
  topGeo.setAttribute('position', new Float32BufferAttribute(topPos, 3))
  topGeo.setAttribute('normal', new Float32BufferAttribute(topNorm, 3))
  topGeo.setAttribute('uv', new Float32BufferAttribute(topUv, 2))
  topGeo.computeBoundingSphere()

  const wallGeo = new BufferGeometry()
  wallGeo.setAttribute('position', new Float32BufferAttribute(wallPos, 3))
  wallGeo.computeVertexNormals()
  wallGeo.computeBoundingSphere()

  const lineGeo = new BufferGeometry()
  lineGeo.setAttribute('position', new Float32BufferAttribute(linePos, 3))

  return {
    top: topGeo,
    walls: wallGeo,
    outline: lineGeo,
    aspect: w / h,
    centroid: [lat0, (minX + maxX) / 2],
  }
}
