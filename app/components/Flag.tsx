/* eslint-disable @next/next/no-img-element -- flags are tiny static files (WebP/SVG), no optimisation needed */
import { flagSvg, flagThumb } from '../data/flags'

export default function Flag({
  id,
  name,
  vector = false,
  className = '',
}: {
  id: string
  name?: string
  /** Use the SVG version (large displays) */
  vector?: boolean
  className?: string
}) {
  return (
    <img
      src={vector ? flagSvg(id) : flagThumb(id)}
      alt={name ? `Drapeau : ${name}` : ''}
      loading="lazy"
      decoding="async"
      className={`object-cover ${className}`}
    />
  )
}
