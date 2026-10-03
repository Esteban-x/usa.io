// Wikipedia REST API — fetched on the server and cached for a day
export interface WikiSummary {
  title: string
  extract: string
  url: string
  image?: { src: string; width: number; height: number }
}

const HEADERS = { 'User-Agent': 'usa.io/1.0 (https://github.com/Esteban-x/usa.io)' }
/** Wikimedia only serves a fixed set of thumbnail widths; 960px is one of them */
const THUMB_WIDTH = 960

type RawImage = { source: string; width: number; height: number }

function pickImage(original?: RawImage, thumbnail?: RawImage) {
  if (!original && !thumbnail) return undefined
  const base = original ?? thumbnail!
  if (thumbnail && base.width > THUMB_WIDTH) {
    const src = thumbnail.source.split('?')[0].replace(/\/\d+px-/, `/${THUMB_WIDTH}px-`)
    return { src, width: THUMB_WIDTH, height: Math.round((base.height * THUMB_WIDTH) / base.width) }
  }
  return { src: base.source.split('?')[0], width: base.width, height: base.height }
}

export async function getWikiSummary(lang: 'fr' | 'en', title: string): Promise<WikiSummary | null> {
  try {
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(' ', '_'))}`,
      { headers: HEADERS, next: { revalidate: 86400 } },
    )
    if (!res.ok) return null
    const d = await res.json()
    return {
      title: d.title,
      extract: d.extract,
      url: d.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      image: pickImage(d.originalimage, d.thumbnail),
    }
  } catch {
    return null
  }
}
