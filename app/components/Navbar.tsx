'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import type { StateLite } from '../lib/types'
import CommandPalette from './CommandPalette'

const links = [
  { name: 'Carte', path: '/' },
  { name: 'États', path: '/etats' },
  { name: 'Street View', path: '/street-view' },
]

export default function Navbar({ states }: { states: StateLite[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path))

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
        <nav className="glass pointer-events-auto flex items-center gap-1 rounded-full p-1.5 pl-4 shadow-[0_10px_40px_-10px_rgb(0_0_0/0.6)]">
          <Link href="/" className="mr-2 flex items-center gap-2" aria-label="Accueil USA.io">
            <Logo />
            <span className="hidden font-display text-xl italic tracking-tight sm:inline">USA.io</span>
          </Link>
          {links.map((l) => (
            <Link
              key={l.path}
              href={l.path}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors sm:px-4 ${
                isActive(l.path) ? 'bg-white/10 text-white' : 'text-mist hover:text-white'
              }`}
            >
              {l.name}
            </Link>
          ))}
          <button
            onClick={() => setOpen(true)}
            className="ml-1 flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-mist ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            aria-label="Rechercher un État"
          >
            <Search className="size-4" />
            <kbd className="hidden font-mono text-[11px] text-mist/80 md:inline">Ctrl K</kbd>
          </button>
        </nav>
      </header>
      {open && <CommandPalette onClose={() => setOpen(false)} states={states} />}
    </>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b6cff" />
          <stop offset="1" stopColor="#ff2d55" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#logo-g)" opacity="0.9" />
      <path
        d="M16 7.5l2.47 5.6 6.08.53-4.6 4.03 1.37 5.95L16 20.5l-5.32 3.1 1.37-5.95-4.6-4.03 6.08-.53z"
        fill="#fff"
      />
    </svg>
  )
}
