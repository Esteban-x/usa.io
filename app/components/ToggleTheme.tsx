'use client'
import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { BsMoon, BsSun } from 'react-icons/bs'

const ToggleTheme = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      className="fixed bottom-5 right-5 bg-white w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-xl rounded-full text-black flex items-center dark:text-gray-300 dark:border-black justify-center hover:scale-[1.15] active:scale-105 transition-all dark:bg-[#202F47]/65"
      onClick={toggleTheme}
    >
      {theme === 'light' ? <BsSun /> : <BsMoon />}
    </button>
  )
}

export default ToggleTheme
