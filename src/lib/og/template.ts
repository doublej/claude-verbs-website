export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export interface SetOgTemplateInput {
  displayName: string
  description: string
  author: string
  category: string
  language: string
  verbCount: number
}

const CATEGORY_LABELS: Record<string, string> = {
  entertainment: 'entertainment',
  music: 'music',
  gaming: 'gaming',
  literature: 'literature',
  science: 'science',
  tech: 'tech',
  sport: 'sport',
  culture: 'culture',
  original: 'original',
  'tv-show': 'entertainment',
  movie: 'entertainment',
  game: 'gaming',
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}...`
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function wrapWords(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']

  const lines = ['']

  for (const word of words) {
    const current = lines[lines.length - 1]
    const candidate = current ? `${current} ${word}` : word

    if (candidate.length <= maxChars) {
      lines[lines.length - 1] = candidate
      continue
    }

    if (lines.length === maxLines) break
    lines.push(word)
  }

  const lastIndex = lines.length - 1
  lines[lastIndex] = truncate(lines[lastIndex], maxChars)
  return lines
}

function normalizeCategory(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

function normalizeLocale(language: string): string {
  return language.replace('_', '-')
}

export function buildSetOgSvg(input: SetOgTemplateInput): string {
  const title = escapeXml(truncate(input.displayName, 72))
  const descriptionLines = wrapWords(input.description, 84, 3).map((line) => escapeXml(line))
  const nameLine = escapeXml(truncate(`name: ${input.displayName}`, 96))
  const categoryLine = escapeXml(truncate(`category: ${normalizeCategory(input.category)}`, 96))
  const languageLine = escapeXml(truncate(`language: ${normalizeLocale(input.language)}`, 96))
  const authorLine = escapeXml(truncate(`author: ${input.author}`, 96))
  const countLine = escapeXml(truncate(`verbCount: ${input.verbCount}`, 96))

  const descriptionSvg = descriptionLines
    .map((line, index) => {
      const y = 198 + index * 44
      return `<text x="48" y="${y}" font-family="monospace" font-size="34" fill="#111111">${line}</text>`
    })
    .join('\n')

  return `<svg width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" viewBox="0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#ffffff"/>
  <text x="48" y="86" font-family="monospace" font-size="56" fill="#111111">${title}</text>
  ${descriptionSvg}
  <text x="48" y="392" font-family="monospace" font-size="30" fill="#111111">${nameLine}</text>
  <text x="48" y="436" font-family="monospace" font-size="30" fill="#111111">${categoryLine}</text>
  <text x="48" y="480" font-family="monospace" font-size="30" fill="#111111">${languageLine}</text>
  <text x="48" y="524" font-family="monospace" font-size="30" fill="#111111">${authorLine}</text>
  <text x="48" y="568" font-family="monospace" font-size="30" fill="#111111">${countLine}</text>
</svg>`
}

export function buildDefaultOgSvg(): string {
  return buildSetOgSvg({
    displayName: 'Claude Verbs',
    description: 'Themed spinner verb sets for Claude Code',
    author: 'Community',
    category: 'original',
    language: 'en_GB',
    verbCount: 50,
  })
}
