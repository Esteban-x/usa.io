const nf = new Intl.NumberFormat('fr-FR')
const compact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 })

export const formatNumber = (n: number) => nf.format(n)
export const formatCompact = (n: number) => compact.format(n)
export const formatKm2 = (n: number) => `${nf.format(Math.round(n))} km²`
export const formatUsd = (n: number) => `${nf.format(n)} $`
export const formatGdp = (billions: number) => `${nf.format(Math.round(billions))} Md$`

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

export const ordinal = (n: number) => (n === 1 ? '1er' : `${n}e`)
