import type { Metadata } from 'next'
import { states } from '../data/states'
import { toLite } from '../lib/lite'
import StatesGrid from '../components/StatesGrid'

export const metadata: Metadata = {
  title: 'Les 50 États',
  description: 'Tous les États des États-Unis : drapeaux, capitales, population, superficie et date d’entrée dans l’Union.',
}

export default function StatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 md:pt-36">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Annuaire</p>
      <h1 className="mt-3 font-display text-6xl tracking-tight sm:text-7xl">
        Les <span className="italic text-gradient">50 États</span>
      </h1>
      <p className="mt-4 max-w-xl text-mist">
        Et le district de Columbia, siège de la capitale fédérale. Filtrez par région, triez par population,
        superficie ou ancienneté, et ouvrez la fiche de chacun.
      </p>
      <StatesGrid states={states.map(toLite)} />
    </main>
  )
}
