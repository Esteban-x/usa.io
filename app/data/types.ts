export type Region = 'Nord-Est' | 'Midwest' | 'Sud' | 'Ouest'

export interface City {
  name: string
  /** Population of the city proper, 2020 census */
  population: number
}

export interface Landmark {
  /** French display name */
  name: string
  /** One or two French sentences */
  description: string
  /** Exact title of the English Wikipedia article (used to fetch a photo) */
  wikiTitleEn: string
  /** Coordinates precise enough to open Google Street View nearby */
  lat: number
  lng: number
}

export interface StateInfo {
  /** Lower-case postal code, e.g. 'tx' */
  id: string
  /** Two-digit FIPS code as string, e.g. '48' */
  fips: string
  /** Upper-case postal code, e.g. 'TX' */
  abbreviation: string
  /** English name, e.g. 'North Carolina' */
  name: string
  /** French name, e.g. 'Caroline du Nord' */
  nameFr: string
  /** URL slug from the French name, lower-case ASCII with dashes, e.g. 'caroline-du-nord' */
  slug: string
  /** Exact title of the French Wikipedia article about the state */
  wikiTitleFr: string
  nickname: string
  nicknameFr: string
  capital: string
  largestCity: string
  /** 2020 census resident population */
  population: number
  /** July 1st 2024 Census Bureau estimate */
  populationEstimate2024: number
  /** Total area in km² */
  areaKm2: number
  /** ISO date of admission to the Union (ratification of the Constitution for the 13 original states). null for DC */
  admissionDate: string | null
  /** Order of admission 1-50. null for DC */
  admissionOrder: number | null
  region: Region
  motto: { original: string; fr: string } | null
  /** IANA time zones covering the state, main one first */
  timezones: string[]
  /** Nominal GDP 2023 in billions of USD (BEA) */
  gdpBillionUsd: number
  /** Median household income 2023 in USD (ACS) */
  medianHouseholdIncome: number
  highestPoint: { name: string; elevationM: number }
  /** Official symbols, French names */
  bird: string
  flower: string
  tree: string
  /** Electoral votes for the 2024 presidential election */
  electoralVotes: number
  /** Party that won the state in the 2024 presidential election */
  winner2024: 'R' | 'D'
  /** Geographic centre used for weather, [lat, lng] */
  center: [number, number]
  /** One catchy French sentence (max ~160 chars) */
  tagline: string
  /** Three French paragraphs: history, geography & nature, economy & culture (80-130 words each) */
  description: [string, string, string]
  /** Four surprising, verifiable facts, in French */
  funFacts: string[]
  /** Five largest cities by population (2020 census), largest first. DC: list its main neighborhoods? no — give the city itself only */
  cities: City[]
  /** Three iconic places */
  landmarks: Landmark[]
}
