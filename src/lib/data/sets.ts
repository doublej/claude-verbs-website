import type { VerbSet, VerbSets } from './types'

interface RawSetJson {
  name: string
  description: string
  author: string
  github: string
  config: { spinnerVerbs: { verbs: string[] } }
}

function normalizeVerb(line: string): string {
  return line.replace(/^\s*I(?:[\u2019']m| am)\s+/i, '')
}

function langFromPath(path: string): string {
  // path like "./sets/nl/jiskefet.json" or "./sets/en/countries/egypt-comedy.json"
  const parts = path.replace('./sets/', '').split('/')
  // First segment is language.
  return parts[0]
}

function toVerbSet(raw: RawSetJson, lang: string): VerbSet {
  const verbs = raw.config.spinnerVerbs.verbs.map(normalizeVerb)
  return {
    name: raw.name,
    description: raw.description,
    author: raw.author,
    github: raw.github,
    language: lang,
    verbCount: verbs.length,
    verbs,
  }
}

const modules = import.meta.glob<RawSetJson>('./sets/**/*.json', {
  eager: true,
  import: 'default',
})

let cached: VerbSets | null = null

export function loadSets(): VerbSets {
  if (cached) return cached

  const sets: VerbSets = {}
  for (const [path, raw] of Object.entries(modules)) {
    if (path.includes('schema.json')) continue
    const lang = langFromPath(path)
    const set = toVerbSet(raw, lang)
    if (!sets[lang]) sets[lang] = []
    sets[lang].push(set)
  }
  cached = sets
  return sets
}
