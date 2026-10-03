import type { Region } from '../data/types'

/** Subset of StateInfo sent to client components (keeps the bundle small) */
export interface StateLite {
  id: string
  slug: string
  name: string
  nameFr: string
  abbreviation: string
  capital: string
  population: number
  areaKm2: number
  admissionOrder: number | null
  region: Region
  nicknameFr: string
  center: [number, number]
}

export interface StateShape {
  id: string
  /** GeoJSON-like polygons: [polygon][ring][point] = [lon, lat] */
  polygons: [number, number][][][]
}
