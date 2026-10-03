import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import { states } from './data/states'
import { toLite } from './lib/lite'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'USA.io — Explorez les 50 États', template: '%s · USA.io' },
  description:
    "Découvrez les 50 États des États-Unis d'Amérique grâce à un globe 3D interactif : drapeaux, chiffres clés, histoire, météo en direct et lieux emblématiques.",
}

export const viewport: Viewport = { themeColor: '#05070f' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <body className="font-sans">
        <Navbar states={states.map(toLite)} />
        {children}
      </body>
    </html>
  )
}
