import { fetchWeatherApi } from 'openmeteo'

export const fetchWeather = async (params: paramsType) => {
  const url = 'https://api.open-meteo.com/v1/gfs'
  const responses = await fetchWeatherApi(url, params)
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step)
  const response = responses[0]
  const utcOffsetSeconds = response.utcOffsetSeconds()
  const timezone = response.timezone()
  const current = response.current()
  if (!current) {
    throw new Error('No current data')
  }
  const weatherData = {
    current: {
      temperature2m: parseFloat(current.variables(0)!.value().toFixed()),
    },
  }

  console.log(weatherData)

  return weatherData
}
