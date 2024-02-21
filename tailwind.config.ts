import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fillOpacity: {
        '0': '0',
        '50': '.5',
        '100': '1',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        google: ['Google Sans', 'sans-serif'],
      },
      fontSize: {
        xxs: '0.83rem',
      },
      screens: {
        big: '2003px',
        fold: '250px',
        se: '320px',
      },
      keyframes: {
        slideUpAndFade: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          '0%': { opacity: '0', transform: 'translateX(-2px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideDownAndFade: {
          '0%': { opacity: '0', transform: 'translateY(-2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          '0%': { opacity: '0', transform: 'translateX(2px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        slideUpAndFade: 'slideUpAndFade 300ms cubic-bezier(0.16, 0, 0.13, 1)',
        slideDownAndFade:
          'slideDownAndFade 300ms cubic-bezier(0.16, 0, 0.13, 1)',
        slideRightAndFade:
          'slideRightAndFade 300ms cubic-bezier(0.16, 0, 0.13, 1)',
        slideLeftAndFade:
          'slideLeftAndFade 300ms cubic-bezier(0.16, 0, 0.13, 1)',
      },
    },
  },
  variants: {
    extend: {
      fillOpacity: ['responsive', 'hover', 'focus', 'group-hover'],
    },
  },
  plugins: [],
}
export default config
