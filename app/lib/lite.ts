import type { StateInfo } from '../data/types'
import type { StateLite } from './types'

export const toLite = (s: StateInfo): StateLite => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  nameFr: s.nameFr,
  abbreviation: s.abbreviation,
  capital: s.capital,
  population: s.populationEstimate2024,
  areaKm2: s.areaKm2,
  admissionOrder: s.admissionOrder,
  region: s.region,
  nicknameFr: s.nicknameFr,
  center: s.center,
})
