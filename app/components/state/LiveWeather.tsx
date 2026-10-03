'use client'

import { useEffect, useState } from 'react'
import { Droplets, Wind } from 'lucide-react'
import { describeWeather, fetchForecast, type CurrentWeather, type DailyForecast } from '@/app/lib/weather'

export default function LiveWeather({
  lat,
  lng,
  timezone,
  place,
}: {
  lat: number
  lng: number
  timezone: string
  place: string
}) {
  const [data, setData] = useState<{ current: CurrentWeather; daily: DailyForecast[] } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchForecast(lat, lng, timezone)
      .then(setData)
      .catch(() => setError(true))
  }, [lat, lng, timezone])

  if (error) return <p className="text-sm text-mist">Météo indisponible pour le moment.</p>
  if (!data) return <div className="h-44 animate-pulse rounded-xl bg-white/5" />

  const { current, daily } = data
  const now = describeWeather(current.code, current.isDay)
  const min = Math.min(...daily.map((d) => d.min))
  const max = Math.max(...daily.map((d) => d.max))

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-mist">{place}</p>
          <p className="mt-1 flex items-center gap-3">
            <span className="text-5xl" aria-hidden>
              {now.icon}
            </span>
            <span className="font-display text-6xl leading-none">{current.temperature}°</span>
          </p>
          <p className="mt-2 text-sm text-mist">
            {now.label} · ressenti {current.apparent}°
          </p>
        </div>
        <div className="space-y-1 text-right text-xs text-mist">
          <p className="flex items-center justify-end gap-1.5">
            <Wind className="size-3.5" /> {current.wind} km/h
          </p>
          <p className="flex items-center justify-end gap-1.5">
            <Droplets className="size-3.5" /> {current.humidity} %
          </p>
        </div>
      </div>
      <ul className="mt-6 space-y-1.5">
        {daily.map((d, i) => {
          const w = describeWeather(d.code)
          const left = ((d.min - min) / (max - min || 1)) * 100
          const width = ((d.max - d.min) / (max - min || 1)) * 100
          return (
            <li key={d.date} className="grid grid-cols-[3.5rem_1.5rem_2rem_1fr_2rem] items-center gap-2 text-sm" title={w.label}>
              <span className="text-mist">
                {i === 0
                  ? 'Auj.'
                  : new Date(`${d.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short' })}
              </span>
              <span aria-hidden>{w.icon}</span>
              <span className="text-right text-mist">{d.min}°</span>
              <span className="relative h-1.5 rounded-full bg-white/10">
                <span
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-400 to-amber-300"
                  style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                />
              </span>
              <span>{d.max}°</span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-[11px] text-mist/70">Données en direct : Open-Meteo</p>
    </div>
  )
}
