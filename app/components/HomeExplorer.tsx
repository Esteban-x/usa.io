'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, LocateFixed, Minus, MousePointerClick, Plus, Shuffle, X } from 'lucide-react'
import type { StateLite } from '../lib/types'
import type { CameraCommand } from './globe/GlobeScene'
import { describeWeather, fetchCurrentWeatherBatch, type CurrentWeather } from '../lib/weather'
import { formatCompact, formatKm2, formatNumber, ordinal } from '../lib/format'
import Flag from './Flag'

const GlobeScene = dynamic(() => import('./globe/GlobeScene'), { ssr: false })

export default function HomeExplorer({ states }: { states: StateLite[] }) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  /** On touch screens the first tap selects, the second opens the page */
  const [selected, setSelected] = useState<string | null>(null)
  const [command, setCommand] = useState<CameraCommand | null>(null)
  const [ready, setReady] = useState(false)
  const [weather, setWeather] = useState<Record<string, CurrentWeather>>({})
  const tooltip = useRef<HTMLDivElement>(null)
  const byId = useMemo(() => new Map(states.map((s) => [s.id, s])), [states])
  const cmd = useCallback((c: Omit<CameraCommand, 'n'>) => setCommand({ ...c, n: Date.now() }), [])

  // Live temperatures for every state, in a single Open-Meteo request
  useEffect(() => {
    fetchCurrentWeatherBatch(states.map((s) => s.center))
      .then((list) => setWeather(Object.fromEntries(list.map((w, i) => [states[i].id, w]))))
      .catch(() => {})
  }, [states])

  // The hover card follows the cursor without re-rendering React
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = tooltip.current
      if (!el) return
      const x = Math.min(e.clientX + 22, window.innerWidth - el.offsetWidth - 12)
      const y = Math.min(e.clientY + 22, window.innerHeight - el.offsetHeight - 12)
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useEffect(() => {
    const s = hovered ? byId.get(hovered) : undefined
    document.body.style.cursor = s ? 'pointer' : ''
    if (s) router.prefetch(`/etats/${s.slug}`)
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered, byId, router])

  const open = useCallback(
    (id: string) => {
      const s = byId.get(id)
      if (!s) return
      cmd({ type: 'focus', id })
      setTimeout(() => router.push(`/etats/${s.slug}`), 650)
    },
    [byId, router, cmd],
  )

  const onSelect = useCallback(
    (id: string, pointerType: string) => {
      if (pointerType === 'touch' && selected !== id) {
        setSelected(id)
        return
      }
      open(id)
    },
    [open, selected],
  )

  const random = () => {
    const s = states[Math.floor(Math.random() * states.length)]
    setSelected(s.id)
    cmd({ type: 'focus', id: s.id })
  }

  const hoveredState = hovered ? byId.get(hovered) : undefined
  const selectedState = selected ? byId.get(selected) : undefined

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0">
        <GlobeScene
          states={states}
          hovered={hovered ?? selected}
          onHover={setHovered}
          onSelect={onSelect}
          command={command}
          onReady={() => setReady(true)}
        />
      </div>

      {/* Loader */}
      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-1000 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-mist">
          <div className="size-10 animate-spin rounded-full border-2 border-white/10 border-t-glory-red" />
          <p className="text-sm tracking-wide">Chargement du globe…</p>
        </div>
      </div>

      {/* Title */}
      <section className="pointer-events-none absolute left-4 top-24 max-w-md sm:left-8 sm:top-28">
        <p className="animate-rise font-mono text-xs uppercase tracking-[0.3em] text-mist">
          50 États · 1 district · 1 globe
        </p>
        <h1 className="animate-rise mt-3 font-display text-5xl leading-[0.95] tracking-tight [animation-delay:120ms] sm:text-7xl">
          <span className="text-gradient">Explorez</span>
          <br />
          <span className="italic text-white/90">les États-Unis</span>
        </h1>
        <p className="animate-rise mt-4 hidden max-w-sm text-sm leading-relaxed text-mist [animation-delay:240ms] sm:block">
          Survolez un État pour révéler son drapeau, cliquez pour découvrir son histoire, ses chiffres
          clés, sa météo en direct et ses lieux incontournables.
        </p>
      </section>

      {/* Camera controls */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-2 sm:right-8">
        <ControlButton label="Zoomer" onClick={() => cmd({ type: 'zoomIn' })}>
          <Plus className="size-4" />
        </ControlButton>
        <ControlButton label="Dézoomer" onClick={() => cmd({ type: 'zoomOut' })}>
          <Minus className="size-4" />
        </ControlButton>
        <ControlButton label="Recentrer sur les États-Unis" onClick={() => cmd({ type: 'reset' })}>
          <LocateFixed className="size-4" />
        </ControlButton>
        <ControlButton label="Un État au hasard" onClick={random}>
          <Shuffle className="size-4" />
        </ControlButton>
      </div>

      {/* Hint */}
      <div className="glass pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs text-mist lg:flex">
        <MousePointerClick className="size-3.5" />
        Glissez pour faire tourner · Molette pour zoomer · Clic pour ouvrir la fiche
      </div>

      {/* Hover card (desktop) */}
      <div
        ref={tooltip}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block"
        style={{ transform: 'translate3d(-999px,-999px,0)' }}
      >
        {hoveredState && !selectedState && (
          <StateCard key={hoveredState.id} state={hoveredState} weather={weather[hoveredState.id]} />
        )}
      </div>

      {/* Selected card (touch / random) */}
      {selectedState && (
        <div className="absolute inset-x-4 bottom-6 z-30 sm:left-8 sm:right-auto sm:w-80">
          <StateCard
            key={selectedState.id}
            state={selectedState}
            weather={weather[selectedState.id]}
            onClose={() => setSelected(null)}
            action={
              <Link
                href={`/etats/${selectedState.slug}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-medium text-ink transition hover:bg-white/90"
              >
                Voir la fiche <ArrowRight className="size-4" />
              </Link>
            }
          />
        </div>
      )}
    </main>
  )
}

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="glass grid size-10 place-items-center rounded-full text-mist transition hover:text-white"
    >
      {children}
    </button>
  )
}

function StateCard({
  state,
  weather,
  onClose,
  action,
}: {
  state: StateLite
  weather?: CurrentWeather
  onClose?: () => void
  action?: React.ReactNode
}) {
  const w = weather && describeWeather(weather.code, weather.isDay)
  return (
    <div className="glass animate-rise pointer-events-auto w-full overflow-hidden rounded-2xl p-4 shadow-2xl [animation-duration:250ms] md:w-72">
      <div className="flex items-center gap-3">
        <Flag id={state.id} name={state.nameFr} className="h-10 w-15 shrink-0 rounded-md ring-1 ring-white/15" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-2xl leading-tight">{state.nameFr}</p>
          <p className="truncate text-xs text-mist">{state.nicknameFr}</p>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Fermer" className="self-start text-mist hover:text-white">
            <X className="size-4" />
          </button>
        )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Stat label="Capitale" value={state.capital} />
        <Stat label="Population" value={`${formatCompact(state.population)} hab.`} />
        <Stat label="Superficie" value={formatKm2(state.areaKm2)} />
        <Stat
          label="Météo"
          value={w && weather ? `${w.icon} ${weather.temperature} °C` : '—'}
          title={w && weather ? `${w.label}, ressenti ${weather.apparent} °C` : undefined}
        />
      </dl>
      <p className="mt-3 text-[11px] text-mist">
        {state.admissionOrder ? `${ordinal(state.admissionOrder)} État à rejoindre l’Union` : 'District fédéral'} ·{' '}
        {formatNumber(Math.round(state.population / state.areaKm2))} hab./km²
      </p>
      {action}
    </div>
  )
}

function Stat({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-2.5 py-2" title={title}>
      <dt className="text-[10px] uppercase tracking-wider text-mist">{label}</dt>
      <dd className="mt-0.5 truncate text-sm text-white">{value}</dd>
    </div>
  )
}
