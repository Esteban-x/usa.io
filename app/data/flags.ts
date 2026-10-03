/** Lightweight flag used as texture / thumbnail */
export const flagThumb = (id: string) => (id === 'dc' ? '/flags/dc.svg' : `/flags/${id}.webp`)
/** Vector flag for large displays */
export const flagSvg = (id: string) => `/flags/${id}.svg`
