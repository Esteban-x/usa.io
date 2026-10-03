import type { Metadata } from 'next'
import { states } from '../data/states'
import StreetViewExplorer, { type Spot } from '../components/StreetViewExplorer'

export const metadata: Metadata = {
  title: 'Street View',
  description: 'Plus de 150 lieux emblématiques des États-Unis à explorer en immersion avec Google Street View.',
}

export default function StreetViewPage() {
  const spots: Spot[] = states.flatMap((s) =>
    s.landmarks.map((l) => ({
      ...l,
      stateId: s.id,
      stateName: s.nameFr,
      stateSlug: s.slug,
      region: s.region,
    })),
  )
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 md:pt-36">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Road trip virtuel</p>
      <h1 className="mt-3 font-display text-6xl tracking-tight sm:text-7xl">
        <span className="italic text-gradient">Street View</span>
      </h1>
      <p className="mt-4 max-w-xl text-mist">
        {spots.length} lieux emblématiques, trois par État. Choisissez une destination ou laissez le hasard
        décider, puis plongez dans le paysage avec Google Street View.
      </p>
      <StreetViewExplorer spots={spots} />
    </main>
  )
}
