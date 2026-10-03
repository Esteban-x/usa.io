'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Region } from '../data/types'
import type { StateLite } from '../lib/types'
import { formatCompact, formatKm2, ordinal } from '../lib/format'
import { normalize } from './CommandPalette'
import Flag from './Flag'

const REGIONS: ('Toutes' | Region)[] = ['Toutes', 'Nord-Est', 'Midwest', 'Sud', 'Ouest']
const SORTS = {
  name: { label: 'Nom', fn: (a: StateLite, b: StateLite) => a.nameFr.localeCompare(b.nameFr, 'fr') },
  population: { label: 'Population', fn: (a: StateLite, b: StateLite) => b.population - a.population },
  area: { label: 'Superficie', fn: (a: StateLite, b: StateLite) => b.areaKm2 - a.areaKm2 },
  admission: {
    label: 'Ancienneté',
    fn: (a: StateLite, b: StateLite) => (a.admissionOrder ?? 99) - (b.admissionOrder ?? 99),
  },
}
type SortKey = keyof typeof SORTS

export default function StatesGrid({ states }: { states: StateLite[] }) {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>('Toutes')
  const [sort, setSort] = useState<SortKey>('name')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = normalize(query.trim())
    return states
      .filter((s) => region === 'Toutes' || s.region === region)
      .filter((s) => !q || [s.nameFr, s.name, s.capital, s.abbreviation].some((f) => normalize(f).includes(q)))
      .sort(SORTS[sort].fn)
  }, [states, region, sort, query])

  return (
    <>
      <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="glass flex flex-1 items-center gap-2 rounded-full px-4">
          <Search className="size-4 text-mist" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un État ou une capitale…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-mist/60"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Segmented options={REGIONS.map((r) => [r, r])} value={region} onChange={setRegion} />
          <Segmented
            options={(Object.keys(SORTS) as SortKey[]).map((k) => [k, SORTS[k].label])}
            value={sort}
            onChange={setSort}
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-mist">{list.length} résultat{list.length > 1 ? 's' : ''}</p>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <li key={s.id}>
            <Link
              href={`/etats/${s.slug}`}
              className="glass group relative flex items-center gap-4 overflow-hidden rounded-2xl p-3 transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                <Flag id={s.id} name={s.nameFr} className="h-full w-full transition duration-500 group-hover:scale-110" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2">
                  <span className="truncate font-display text-2xl leading-tight">{s.nameFr}</span>
                  <span className="font-mono text-[11px] text-mist">{s.abbreviation}</span>
                </p>
                <p className="truncate text-xs text-mist">
                  {s.capital} · {formatCompact(s.population)} hab. · {formatKm2(s.areaKm2)}
                </p>
                <p className="mt-0.5 text-[11px] text-mist/70">
                  {s.admissionOrder ? `${ordinal(s.admissionOrder)} État` : 'District fédéral'} · {s.region}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, string][]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="glass flex rounded-full p-1">
      {options.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          aria-pressed={value === k}
          className={`rounded-full px-3 py-1.5 text-xs transition ${value === k ? 'bg-white text-ink' : 'text-mist hover:text-white'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
