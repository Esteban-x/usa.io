import type { StateInfo } from '../types'
import { partA } from './partA'
import { partB } from './partB'
import { partC } from './partC'
import { partD } from './partD'

/** The 50 states + District of Columbia, sorted by French name */
export const states: StateInfo[] = [...partA, ...partB, ...partC, ...partD].sort((a, b) =>
  a.nameFr.localeCompare(b.nameFr, 'fr'),
)

const byId = new Map(states.map((s) => [s.id, s]))
const bySlug = new Map(states.map((s) => [s.slug, s]))

export const getStateById = (id: string) => byId.get(id)
export const getStateBySlug = (slug: string) => bySlug.get(slug)

export { flagThumb, flagSvg } from '../flags'
