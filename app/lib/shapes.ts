import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { geoPath, geoTransverseMercator } from 'd3-geo'
import type { StateShape } from './types'

let cache: StateShape[] | null = null
const shapes = () => (cache ??= JSON.parse(readFileSync(join(process.cwd(), 'public/data/states.json'), 'utf8')))

/** SVG path of a state fitted in a width × height box, with its bounding box */
export function stateOutline(id: string, center: [number, number], width = 400, height = 300) {
  const shape = shapes().find((s: StateShape) => s.id === id)
  if (!shape) return null
  const geo = { type: 'MultiPolygon' as const, coordinates: shape.polygons }
  const projection = geoTransverseMercator()
    .rotate([-center[1], -center[0]])
    .fitExtent(
      [
        [8, 8],
        [width - 8, height - 8],
      ],
      geo,
    )
  const path = geoPath(projection)
  const [[x0, y0], [x1, y1]] = path.bounds(geo)
  return { d: path(geo) ?? '', box: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } }
}
