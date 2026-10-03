'use client'

import { useEffect, useState } from 'react'

const label = (tz: string) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: tz, timeZoneName: 'long' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')?.value ?? tz

/** Live local time in each time zone of the state */
export default function LocalClock({ timezones }: { timezones: string[] }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    const first = setTimeout(tick, 0)
    const t = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(t)
    }
  }, [])

  return (
    <ul className="space-y-4">
      {timezones.map((tz, i) => (
        <li key={tz}>
          <p className={`font-mono tabular-nums ${i === 0 ? 'text-4xl' : 'text-2xl text-white/80'}`}>
            {now
              ? now.toLocaleTimeString('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '--:--:--'}
          </p>
          <p className="mt-1 text-xs text-mist">
            {now ? `${now.toLocaleDateString('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' })} · ` : ''}
            {label(tz)}
          </p>
        </li>
      ))}
    </ul>
  )
}
