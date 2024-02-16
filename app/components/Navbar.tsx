'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AiOutlineSearch } from 'react-icons/ai'

const Navbar = () => {
  const links = [
    { name: 'Map', path: '/' },
    { name: 'États', path: '/informations' },
    { name: 'Street-view', path: '/contact' },
  ]
  const currentRoute = usePathname()
  return (
    <nav className="top-0 py-2 w-full z-10 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex  items-center shadow-sm dark:bg-[#202F47] bg-white rounded-full px-6 fold:px-3 se:px-4 se:space-x-2 lg:px-6 2xl:px-14 xl:px-10 md:px-6 sm:px-6 py-1 md:space-x-5 lg:space-x-7 xl:space-x-7 2xl:space-x-8 ">
              <Link href="/">
                <div className="shrink-0 cursor-pointer">
                  <Image
                    className="dark:opacity-85 xl:w-8 lg:w-8  md:w-8 w-6 mr-2 h-auto sm:w-6"
                    src="/flag.svg"
                    width={40}
                    height={40}
                    alt="Logo"
                  />
                </div>
              </Link>
              {links.map((link, index) => (
                <Link
                  className={`${currentRoute === link.path ? 'text-black/60 dark:text-white' : 'text-black/30 dark:text-gray-300'}  transition-colors hover:text-black/60 se:px-2 sm:px-3 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-1 rounded-full font-google dark:hover:text-white fold:px-2 fold:text-xxs se:text-base sm:text-md md:text-lg lg:text-lg xl:text-xl 2xl:text-xl`}
                  key={index}
                  href={link.path}
                >
                  {link.name}
                </Link>
              ))}
              <AiOutlineSearch className="dark:text-gray-300 cursor-pointer dark:hover:text-white text-black/30 hover:text-black/60 lg:h-[22px] lg:w-[22px] md:h-[22px] md:w-[22px] sm:h-[20px] sm:w-[20px] se:h-[20px] se:w-[20px]" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
