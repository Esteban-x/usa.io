import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/app/components/Navbar'
import ThemeContextProvider from './context/ThemeContext'
import ToggleTheme from './components/ToggleTheme'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'USA',
  description:
    "Découvrez les différents états des états unis d'amérique grâce à une carte interactive",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="dark:bg-black bg-white bg-gradient-to-tr min-h-screen bg-no-repeat from-[#B31942]/20 min-w-screen via-black/10 to-blue-400/30">
        <ThemeContextProvider>
          <Navbar />
          {children}
          <ToggleTheme />
        </ThemeContextProvider>
      </body>
    </html>
  )
}
