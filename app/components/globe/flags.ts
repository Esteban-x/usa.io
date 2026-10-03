import { SRGBColorSpace, Texture, TextureLoader } from 'three'
import { flagThumb } from '@/app/data/flags'

const loader = new TextureLoader()
const cache = new Map<string, Promise<Texture>>()

/** Loads (once) the flag texture of a state */
export function loadFlag(id: string): Promise<Texture> {
  let p = cache.get(id)
  if (!p) {
    p = loader.loadAsync(flagThumb(id)).then((t) => {
      t.colorSpace = SRGBColorSpace
      t.anisotropy = 8
      return t
    })
    p.catch(() => cache.delete(id))
    cache.set(id, p)
  }
  return p
}

/**
 * Crops the texture like CSS `object-fit: cover` so the flag keeps its
 * proportions whatever the shape of the state.
 */
export function coverTexture(tex: Texture, boxAspect: number) {
  const img = tex.image as { width: number; height: number }
  const flagAspect = img.width / img.height
  if (boxAspect > flagAspect) {
    const r = flagAspect / boxAspect
    tex.repeat.set(1, r)
    tex.offset.set(0, (1 - r) / 2)
  } else {
    const r = boxAspect / flagAspect
    tex.repeat.set(r, 1)
    tex.offset.set((1 - r) / 2, 0)
  }
  tex.needsUpdate = true
}
