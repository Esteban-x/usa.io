import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Erreur 404</p>
        <h1 className="mt-3 font-display text-6xl italic">Territoire inconnu</h1>
        <p className="mt-4 text-mist">Cette page n&apos;existe pas, même sur les cartes les plus anciennes.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink">
          Retour au globe
        </Link>
      </div>
    </main>
  )
}
