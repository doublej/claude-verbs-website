import { localeToLang } from '$lib/locale'
import type { VerbSet, VerbSets } from './types'

interface RawSetJson {
  name: string
  displayName?: string
  description: string
  author: string
  github: string
  language: string
  category?: string
  config: { spinnerVerbs: { verbs: string[] } }
}

function normalizeVerb(line: string): string {
  return line.replace(/^\s*I(?:[\u2019']m| am)\s+/i, '')
}

const PREVIEW_LIMIT = 10
const isProd = import.meta.env.PROD

function toVerbSet(raw: RawSetJson): VerbSet {
  const allVerbs = raw.config.spinnerVerbs.verbs.map(normalizeVerb)
  const verbs = isProd ? allVerbs.slice(0, PREVIEW_LIMIT) : allVerbs
  return {
    name: raw.name,
    displayName: raw.displayName ?? raw.name,
    description: raw.description,
    author: raw.author,
    github: raw.github,
    language: raw.language,
    category: raw.category ?? 'original',
    verbCount: allVerbs.length,
    verbs,
  }
}

const modules = import.meta.glob<RawSetJson>('./sets/*.json', {
  eager: true,
  import: 'default',
})

let cached: VerbSets | null = null

export function loadSets(): VerbSets {
  if (cached) return cached

  const sets: VerbSets = {}
  for (const [path, raw] of Object.entries(modules)) {
    if (
      path.includes('schema.json') ||
      path.includes('index.json') ||
      path.includes('_template.json')
    )
      continue
    const set = toVerbSet(raw)
    const lang = localeToLang(raw.language)
    if (!sets[lang]) sets[lang] = []
    sets[lang].push(set)
  }
  cached = sets
  return sets
}

export function findSet(name: string): VerbSet | undefined {
  for (const sets of Object.values(loadSets())) {
    const match = sets.find((s) => s.name === name)
    if (match) return match
  }
}
