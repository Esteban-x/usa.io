import { permanentRedirect } from 'next/navigation'
import { states } from '@/app/data/states'

// Legacy URLs of the first version of the site used English slugs (/state/north-carolina)
export default async function LegacyStatePage({ params }: PageProps<'/state/[slug]'>) {
  const { slug } = await params
  const state = states.find((s) => s.slug === slug || s.name.toLowerCase().replaceAll(' ', '-') === slug)
  permanentRedirect(state ? `/etats/${state.slug}` : '/etats')
}
