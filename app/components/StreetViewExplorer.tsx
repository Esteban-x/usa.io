'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Dices, Map, Navigation, Search } from 'lucide-react'
import type { Landmark, Region } from '../data/types'
import { googleMapsUrl, streetViewUrl } from '../lib/maps'
import { normalize } from './CommandPalette'
import Flag from './Flag'

export interface Spot extends Landmark {
  stateId: string
  stateName: string
  stateSlug: string
  region: Region
}

const REGIONS: ('Toutes' | Region)[] = ['Toutes', 'Nord-Est', 'Midwest', 'Sud', 'Ouest']

/** OpenStreetMap embed (no API key) centred on the spot */
const osmEmbed = (lat: number, lng: number, d = 0.04) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d * 1.6},${lat - d},${lng + d * 1.6},${lat + d}&layer=mapnik&marker=${lat},${lng}`

export default function StreetViewExplorer({ spots }: { spots: Spot[] }) {
  const [featured, setFeatured] = useState<Spot>(spots[0])
  const [region, setRegion] = useState<(typeof REGIONS)[number]>('Toutes')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = normalize(query.trim())
    return spots.filter(
      (s) =>
        (region === 'Toutes' || s.region === region) &&
        (!q || [s.name, s.stateName, s.description].some((f) => normalize(f).includes(q))),
    )
  }, [spots, region, query])

  const surprise = () => {
    const pool = list.length ? list : spots
    let next = featured
    while (pool.length > 1 && next === featured) next = pool[Math.floor(Math.random() * pool.length)]
    setFeatured(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Featured destination */}
      <section className="glass mt-10 grid overflow-hidden rounded-3xl md:grid-cols-[1.3fr_1fr]">
        <iframe
          key={featured.name}
          title={`Carte : ${featured.name}`}
          src={osmEmbed(featured.lat, featured.lng)}
          className="h-72 w-full border-0 opacity-90 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.8)] md:h-full md:min-h-96"
          loading="lazy"
        />
        <div className="flex flex-col p-6 md:p-8">
          <Link href={`/etats/${featured.stateSlug}`} className="flex items-center gap-2 text-sm text-mist hover:text-white">
            <Flag id={featured.stateId} className="h-4 w-6 rounded-sm" /> {featured.stateName}
          </Link>
          <h2 className="mt-4 font-display text-4xl leading-tight">{featured.name}</h2>
          <p className="mt-3 flex-1 leading-relaxed text-white/80">{featured.description}</p>
          <p className="mt-4 font-mono text-xs text-mist">
            {featured.lat.toFixed(4)}°, {featured.lng.toFixed(4)}°
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={streetViewUrl(featured.lat, featured.lng)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-white/85"
            >
              <Navigation className="size-4" /> Ouvrir Street View
            </a>
            <a
              href={googleMapsUrl(featured.lat, featured.lng)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-mist transition hover:text-white"
            >
              <Map className="size-4" /> Google Maps
            </a>
            <button
              onClick={surprise}
              className="flex items-center gap-2 rounded-full border border-glory-red/50 px-4 py-2.5 text-sm text-white transition hover:bg-glory-red/20"
            >
              <Dices className="size-4" /> Destination surprise
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="mt-12 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="glass flex flex-1 items-center gap-2 rounded-full px-4">
          <Search className="size-4 text-mist" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Grand Canyon, phare, Floride…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-mist/60"
          />
        </label>
        <div className="glass flex rounded-full p-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
              className={`rounded-full px-3 py-1.5 text-xs transition ${region === r ? 'bg-white text-ink' : 'text-mist hover:text-white'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <li key={`${s.stateId}-${s.name}`}>
            <button
              onClick={() => {
                setFeatured(s)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`glass flex h-full w-full flex-col rounded-2xl p-4 text-left transition hover:bg-white/10 ${
                featured === s ? 'ring-1 ring-glory-red/60' : ''
              }`}
            >
              <span className="flex items-center gap-2 text-xs text-mist">
                <Flag id={s.stateId} className="h-3.5 w-5 rounded-sm" /> {s.stateName}
              </span>
              <span className="mt-2 font-display text-xl leading-snug">{s.name}</span>
              <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-mist">{s.description}</span>
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-10 text-center text-mist">Aucun lieu ne correspond à votre recherche.</p>}
    </>
  )
}
