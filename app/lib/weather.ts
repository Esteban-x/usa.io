// Open-Meteo (https://open-meteo.com) — free, no API key, CORS enabled.
const API = 'https://api.open-meteo.com/v1/forecast'

export interface CurrentWeather {
  temperature: number
  apparent: number
  humidity: number
  wind: number
  code: number
  isDay: boolean
}

export interface DailyForecast {
  date: string
  code: number
  max: number
  min: number
  precipitation: number
}

/** WMO weather interpretation codes → French label + emoji */
export function describeWeather(code: number, isDay = true): { label: string; icon: string } {
  if (code === 0) return { label: 'Ciel dégagé', icon: isDay ? '☀️' : '🌙' }
  if (code <= 2) return { label: 'Éclaircies', icon: isDay ? '🌤️' : '☁️' }
  if (code === 3) return { label: 'Couvert', icon: '☁️' }
  if (code <= 48) return { label: 'Brouillard', icon: '🌫️' }
  if (code <= 57) return { label: 'Bruine', icon: '🌦️' }
  if (code <= 67) return { label: 'Pluie', icon: '🌧️' }
  if (code <= 77) return { label: 'Neige', icon: '🌨️' }
  if (code <= 82) return { label: 'Averses', icon: '🌦️' }
  if (code <= 86) return { label: 'Averses de neige', icon: '🌨️' }
  return { label: 'Orage', icon: '⛈️' }
}

const CURRENT = 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day'

type RawCurrent = {
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  wind_speed_10m: number
  weather_code: number
  is_day: number
}

const parseCurrent = (c: RawCurrent): CurrentWeather => ({
  temperature: Math.round(c.temperature_2m),
  apparent: Math.round(c.apparent_temperature),
  humidity: c.relative_humidity_2m,
  wind: Math.round(c.wind_speed_10m),
  code: c.weather_code,
  isDay: c.is_day === 1,
})

/** Current weather for many points in a single request */
export async function fetchCurrentWeatherBatch(points: [number, number][]): Promise<CurrentWeather[]> {
  const url = `${API}?latitude=${points.map((p) => p[0]).join(',')}&longitude=${points
    .map((p) => p[1])
    .join(',')}&current=${CURRENT}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  const data = await res.json()
  return (Array.isArray(data) ? data : [data]).map((d: { current: RawCurrent }) => parseCurrent(d.current))
}

/** Current weather + 7 day forecast for one point */
export async function fetchForecast(lat: number, lng: number, timezone: string) {
  const url = `${API}?latitude=${lat}&longitude=${lng}&current=${CURRENT}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=${encodeURIComponent(timezone)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  const d = await res.json()
  const daily: DailyForecast[] = d.daily.time.map((date: string, i: number) => ({
    date,
    code: d.daily.weather_code[i],
    max: Math.round(d.daily.temperature_2m_max[i]),
    min: Math.round(d.daily.temperature_2m_min[i]),
    precipitation: d.daily.precipitation_sum[i],
  }))
  return { current: parseCurrent(d.current), daily }
}
