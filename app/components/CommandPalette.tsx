'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CornerDownLeft, Search } from 'lucide-react'
import type { StateLite } from '../lib/types'
import Flag from './Flag'
import { formatNumber } from '../lib/format'

/** Accent-insensitive normalisation for search */
export const normalize = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Mounted only while open, so its state starts fresh each time */
export default function CommandPalette({
  onClose,
  states,
}: {
  onClose: () => void
  states: StateLite[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const list = useRef<HTMLUListElement>(null)

  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return states
    return states.filter((s) =>
      [s.nameFr, s.name, s.abbreviation, s.capital, s.nicknameFr].some((f) => normalize(f).includes(q)),
    )
  }, [query, states])

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [index])

  const go = (s: StateLite | undefined) => {
    if (!s) return
    onClose()
    router.push(`/etats/${s.slug}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[14vh] backdrop-blur-sm"
      onMouseDown={onClose}
      role="dialog"
      aria-modal
      aria-label="Rechercher un État"
    >
      <div
        className="glass animate-rise w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 text-mist" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIndex(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIndex((i) => Math.min(results.length - 1, i + 1))
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIndex((i) => Math.max(0, i - 1))
              }
              if (e.key === 'Enter') go(results[index])
            }}
            placeholder="Texas, Sacramento, TX, Golden State…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-mist/60"
          />
          <kbd className="font-mono text-[11px] text-mist">Échap</kbd>
        </div>
        <ul ref={list} className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-mist">Aucun État trouvé.</li>}
          {results.map((s, i) => (
            <li key={s.id} data-i={i}>
              <button
                onMouseEnter={() => setIndex(i)}
                onClick={() => go(s)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  i === index ? 'bg-white/10' : ''
                }`}
              >
                <Flag id={s.id} className="h-6 w-9 rounded-sm object-cover ring-1 ring-white/10" />
                <span className="flex-1">
                  <span className="block text-sm text-white">{s.nameFr}</span>
                  <span className="block text-xs text-mist">
                    {s.capital} · {formatNumber(s.population)} hab.
                  </span>
                </span>
                <span className="font-mono text-xs text-mist">{s.abbreviation}</span>
                {i === index && <CornerDownLeft className="size-3.5 text-mist" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
