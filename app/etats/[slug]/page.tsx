import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Clock, CloudSun, ExternalLink, MapPin, Sparkles } from 'lucide-react'
import { getStateBySlug, states } from '@/app/data/states'
import { neighbors } from '@/app/data/generated/neighbors'
import type { Landmark, StateInfo } from '@/app/data/types'
import Flag from '@/app/components/Flag'
import LiveWeather from '@/app/components/state/LiveWeather'
import LocalClock from '@/app/components/state/LocalClock'
import { getWikiSummary } from '@/app/lib/wikipedia'
import { stateOutline } from '@/app/lib/shapes'
import { formatDate, formatGdp, formatKm2, formatNumber, formatUsd, ordinal } from '@/app/lib/format'
import { googleMapsUrl, streetViewUrl } from '@/app/lib/maps'

export function generateStaticParams() {
  return states.map((s) => ({ slug: s.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/etats/[slug]'>): Promise<Metadata> {
  const state = getStateBySlug((await params).slug)
  if (!state) return {}
  return {
    title: state.nameFr,
    description: state.tagline,
    openGraph: { title: `${state.nameFr} · USA.io`, description: state.tagline, images: [`/flags/${state.id}.webp`] },
  }
}

const SECTION_TITLES = ['Histoire', 'Géographie & nature', 'Économie & culture']

export default async function StatePage({ params }: PageProps<'/etats/[slug]'>) {
  const state = getStateBySlug((await params).slug)
  if (!state) notFound()

  const index = states.indexOf(state)
  const prev = states[(index - 1 + states.length) % states.length]
  const next = states[(index + 1) % states.length]
  const outline = stateOutline(state.id, state.center, 480, 360)
  const density = state.populationEstimate2024 / state.areaKm2
  const popRank = [...states].sort((a, b) => b.populationEstimate2024 - a.populationEstimate2024).indexOf(state) + 1
  const areaRank = [...states].sort((a, b) => b.areaKm2 - a.areaKm2).indexOf(state) + 1
  const growth = ((state.populationEstimate2024 - state.population) / state.population) * 100
  const isDC = state.id === 'dc'

  const facts: { label: string; value: string; hint?: string }[] = [
    { label: 'Capitale', value: state.capital },
    { label: 'Plus grande ville', value: state.largestCity },
    {
      label: 'Population (2024)',
      value: formatNumber(state.populationEstimate2024),
      hint: `${ordinal(popRank)} sur 51 · ${growth >= 0 ? '+' : ''}${growth.toFixed(1).replace('.', ',')} % depuis 2020`,
    },
    { label: 'Superficie', value: formatKm2(state.areaKm2), hint: `${ordinal(areaRank)} sur 51` },
    { label: 'Densité', value: `${formatNumber(Math.round(density))} hab./km²` },
    state.admissionDate
      ? {
          label: "Entrée dans l'Union",
          value: formatDate(state.admissionDate),
          hint: state.admissionOrder ? `${ordinal(state.admissionOrder)} État` : undefined,
        }
      : { label: 'Statut', value: 'District fédéral', hint: 'Créé en 1790' },
    { label: 'PIB (2023)', value: formatGdp(state.gdpBillionUsd) },
    { label: 'Revenu médian des ménages', value: formatUsd(state.medianHouseholdIncome), hint: '2023' },
    { label: 'Point culminant', value: state.highestPoint.name, hint: `${formatNumber(state.highestPoint.elevationM)} m` },
    {
      label: 'Présidentielle 2024',
      value: state.winner2024 === 'R' ? 'Républicain' : 'Démocrate',
      hint: `${state.electoralVotes} grands électeurs`,
    },
    { label: 'Région', value: state.region },
    { label: 'Code postal', value: state.abbreviation, hint: `FIPS ${state.fips}` },
  ]

  return (
    <main className="pb-24">
      {/* ------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10">
          <Flag id={state.id} vector className="h-full w-full scale-110 opacity-25 blur-3xl saturate-150" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-28 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-36">
          <div className="animate-rise">
            <nav className="flex items-center gap-2 text-xs text-mist">
              <Link href="/" className="hover:text-white">
                Carte
              </Link>
              <span>/</span>
              <Link href="/etats" className="hover:text-white">
                États
              </Link>
              <span>/</span>
              <span className="text-white">{state.nameFr}</span>
            </nav>
            <div className="mt-6 flex items-center gap-4">
              <Flag
                id={state.id}
                name={state.nameFr}
                vector
                className="h-14 w-21 rounded-lg shadow-2xl ring-1 ring-white/20"
              />
              <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-mist">
                {state.abbreviation} · {state.name}
              </span>
            </div>
            <h1 className="mt-5 font-display text-6xl leading-[0.9] tracking-tight sm:text-8xl">{state.nameFr}</h1>
            <p className="mt-3 font-display text-2xl italic text-white/70">
              « {state.nicknameFr} »<span className="ml-2 text-base not-italic text-mist">— {state.nickname}</span>
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{state.tagline}</p>
            {state.motto && (
              <p className="mt-6 border-l-2 border-glory-red pl-4 text-sm text-mist">
                <span className="italic text-white">{state.motto.original}</span>
                <br />« {state.motto.fr} »
              </p>
            )}
          </div>
          {outline && (
            <div className="relative grid place-items-center">
              <div className="absolute inset-10 rounded-full bg-glory-blue/20 blur-3xl" />
              <svg viewBox="0 0 480 360" className="relative w-full max-w-md drop-shadow-[0_0_30px_rgb(59_108_255/0.5)]" aria-hidden>
                <defs>
                  <pattern id="flag-fill" patternUnits="userSpaceOnUse" {...outline.box}>
                    <image href={`/flags/${state.id}.svg`} width={outline.box.width} height={outline.box.height} preserveAspectRatio="xMidYMid slice" />
                  </pattern>
                  <linearGradient id="outline-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#9db7ff" />
                    <stop offset="1" stopColor="#ff7a93" />
                  </linearGradient>
                </defs>
                <path d={outline.d} fill="url(#flag-fill)" opacity="0.9" />
                <path d={outline.d} fill="none" stroke="url(#outline-g)" strokeWidth="2" />
              </svg>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ---------------------------------------------------- Key facts */}
        <section className="mt-12" aria-labelledby="facts">
          <SectionTitle id="facts">Chiffres clés</SectionTitle>
          <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="glass rounded-2xl p-4">
                <dt className="text-[11px] uppercase tracking-wider text-mist">{f.label}</dt>
                <dd className="mt-1.5 text-lg leading-snug text-white">{f.value}</dd>
                {f.hint && <dd className="mt-1 text-xs text-mist">{f.hint}</dd>}
              </div>
            ))}
          </dl>
        </section>

        {/* -------------------------------------------- Live: weather/time */}
        <section className="mt-12 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm uppercase tracking-wider text-mist">
              <CloudSun className="size-4" /> Météo en direct
            </h2>
            <LiveWeather lat={state.center[0]} lng={state.center[1]} timezone={state.timezones[0]} place={`Centre de l'État · ${state.nameFr}`} />
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm uppercase tracking-wider text-mist">
              <Clock className="size-4" /> Heure locale
            </h2>
            <LocalClock timezones={state.timezones} />
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="text-[11px] uppercase tracking-wider text-mist">Symboles officiels</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>🐦 Oiseau : <span className="text-white">{state.bird}</span></li>
                <li>🌸 Fleur : <span className="text-white">{state.flower}</span></li>
                <li>🌳 Arbre : <span className="text-white">{state.tree}</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- Story */}
        <section className="mt-16 grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-10">
            {state.description.map((p, i) => (
              <article key={i}>
                <h2 className="font-display text-3xl italic">{SECTION_TITLES[i]}</h2>
                <p className="mt-3 text-[17px] leading-8 text-white/80">{p}</p>
              </article>
            ))}
            <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-white/5" />}>
              <WikipediaBlock state={state} />
            </Suspense>
          </div>
          <aside className="space-y-6">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-sm uppercase tracking-wider text-mist">Plus grandes villes</h2>
              <CityBars state={state} />
            </div>
            <div className="glass rounded-3xl p-6">
              <h2 className="flex items-center gap-2 text-sm uppercase tracking-wider text-mist">
                <Sparkles className="size-4" /> Le saviez-vous ?
              </h2>
              <ul className="mt-4 space-y-4">
                {state.funFacts.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/85">
                    <span className="mt-0.5 font-mono text-xs text-glory-red">{String(i + 1).padStart(2, '0')}</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        {/* --------------------------------------------------- Landmarks */}
        <section className="mt-20" aria-labelledby="landmarks">
          <SectionTitle id="landmarks">Lieux incontournables</SectionTitle>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {state.landmarks.map((l) => (
              <Suspense key={l.name} fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
                <LandmarkCard landmark={l} />
              </Suspense>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------- Neighbors */}
        {!isDC && (
          <section className="mt-20" aria-labelledby="neighbors">
            <SectionTitle id="neighbors">États voisins</SectionTitle>
            {neighbors[state.id]?.length ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {neighbors[state.id]
                  .map((id) => states.find((s) => s.id === id))
                  .filter((s): s is StateInfo => !!s)
                  .map((s) => (
                    <Link
                      key={s.id}
                      href={`/etats/${s.slug}`}
                      className="glass flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-sm transition hover:bg-white/10"
                    >
                      <Flag id={s.id} className="size-8 rounded-full" />
                      {s.nameFr}
                    </Link>
                  ))}
              </div>
            ) : (
              <p className="mt-4 text-mist">
                {state.nameFr} ne partage aucune frontière terrestre avec un autre État américain.
              </p>
            )}
          </section>
        )}

        {/* -------------------------------------------------- Prev / next */}
        <nav className="mt-20 grid gap-3 sm:grid-cols-2" aria-label="Autres États">
          <Link href={`/etats/${prev.slug}`} className="glass group flex items-center gap-4 rounded-3xl p-5 transition hover:bg-white/10">
            <ArrowLeft className="size-5 text-mist transition group-hover:-translate-x-1" />
            <Flag id={prev.id} className="h-8 w-12 rounded" />
            <span>
              <span className="block text-xs text-mist">Précédent</span>
              <span className="font-display text-2xl">{prev.nameFr}</span>
            </span>
          </Link>
          <Link href={`/etats/${next.slug}`} className="glass group flex items-center justify-end gap-4 rounded-3xl p-5 text-right transition hover:bg-white/10">
            <span>
              <span className="block text-xs text-mist">Suivant</span>
              <span className="font-display text-2xl">{next.nameFr}</span>
            </span>
            <Flag id={next.id} className="h-8 w-12 rounded" />
            <ArrowRight className="size-5 text-mist transition group-hover:translate-x-1" />
          </Link>
        </nav>
      </div>
    </main>
  )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-4xl tracking-tight sm:text-5xl">
      {children}
    </h2>
  )
}

function CityBars({ state }: { state: StateInfo }) {
  const max = Math.max(...state.cities.map((c) => c.population))
  return (
    <ol className="mt-4 space-y-3">
      {state.cities.map((c) => (
        <li key={c.name} title={`${c.name} : ${formatNumber(c.population)} habitants (recensement 2020)`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-white">
              {c.name}
              {c.name === state.capital && <span className="ml-1.5 text-[10px] uppercase tracking-wider text-glory-red">capitale</span>}
            </span>
            <span className="font-mono text-xs text-mist">{formatNumber(c.population)}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-white/5">
            <div className="h-full rounded-full bg-glory-blue" style={{ width: `${(c.population / max) * 100}%` }} />
          </div>
        </li>
      ))}
      <li className="pt-1 text-[11px] text-mist/70">Population des villes, recensement 2020</li>
    </ol>
  )
}

async function WikipediaBlock({ state }: { state: StateInfo }) {
  const wiki = await getWikiSummary('fr', state.wikiTitleFr)
  if (!wiki?.extract) return null
  return (
    <article className="glass rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-sm uppercase tracking-wider text-mist">
        <BookOpen className="size-4" /> Selon Wikipédia
      </h2>
      <p className="mt-3 leading-7 text-white/80">{wiki.extract}</p>
      <a
        href={wiki.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-glory-blue hover:underline"
      >
        Lire l&apos;article complet <ExternalLink className="size-3.5" />
      </a>
    </article>
  )
}

async function LandmarkCard({ landmark }: { landmark: Landmark }) {
  const wiki = await getWikiSummary('en', landmark.wikiTitleEn)
  return (
    <article className="glass group flex flex-col overflow-hidden rounded-3xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        {wiki?.image ? (
          <Image
            src={wiki.image.src}
            alt={landmark.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            unoptimized // already resized by the Wikimedia CDN
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-mist">
            <MapPin className="size-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl">{landmark.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/75">{landmark.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <a
            href={streetViewUrl(landmark.lat, landmark.lng)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-3 py-1.5 font-medium text-ink transition hover:bg-white/85"
          >
            Street View
          </a>
          <a
            href={googleMapsUrl(landmark.lat, landmark.lng)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line px-3 py-1.5 text-mist transition hover:text-white"
          >
            Carte
          </a>
          {wiki && (
            <a href={wiki.url} target="_blank" rel="noreferrer" className="rounded-full border border-line px-3 py-1.5 text-mist transition hover:text-white">
              Wikipedia
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
