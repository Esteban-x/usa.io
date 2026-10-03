import { states } from '../app/data/states'
const errs: string[] = []
const ids = new Set<string>(), slugs = new Set<string>()
for (const s of states) {
  if (ids.has(s.id)) errs.push(`dup id ${s.id}`); ids.add(s.id)
  if (slugs.has(s.slug)) errs.push(`dup slug ${s.slug}`); slugs.add(s.slug)
  if (!/^[a-z-]+$/.test(s.slug)) errs.push(`bad slug ${s.slug}`)
  if (s.description.length !== 3) errs.push(`${s.id} desc`)
  if (s.funFacts.length !== 4) errs.push(`${s.id} facts ${s.funFacts.length}`)
  if (s.landmarks.length !== 3) errs.push(`${s.id} landmarks`)
  if (s.id !== 'dc' && s.cities.length !== 5) errs.push(`${s.id} cities ${s.cities.length}`)
  if (s.cities[0] && s.cities[0].name !== s.largestCity) errs.push(`${s.id} largest ${s.largestCity} vs ${s.cities[0].name}`)
  for (let i = 1; i < s.cities.length; i++) if (s.cities[i].population > s.cities[i - 1].population) errs.push(`${s.id} city order`)
  for (const l of s.landmarks) if (Math.hypot(l.lat - s.center[0], l.lng - s.center[1]) > 25) errs.push(`${s.id} landmark far ${l.name}`)
  if (!s.timezones.length) errs.push(`${s.id} tz`)
  for (const tz of s.timezones) try { new Intl.DateTimeFormat('fr', { timeZone: tz }) } catch { errs.push(`${s.id} bad tz ${tz}`) }
}
const ev = states.reduce((a, s) => a + s.electoralVotes, 0)
const orders = states.map((s) => s.admissionOrder).filter(Boolean).sort((a, b) => a! - b!)
console.log('count', states.length, 'EV', ev, 'orders ok', orders.every((o, i) => o === i + 1))
console.log('pop2020', states.reduce((a, s) => a + s.population, 0), 'pop2024', states.reduce((a, s) => a + s.populationEstimate2024, 0))
console.log('R EV', states.filter((s) => s.winner2024 === 'R').reduce((a, s) => a + s.electoralVotes, 0))
console.log(errs.join('\n') || 'no errors')
