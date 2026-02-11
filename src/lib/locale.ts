/** Locale code → short language code used in verb set data */
export const SUPPORTED_LOCALES: Record<string, string> = {
  nl_NL: 'nl',
  en_GB: 'en',
  de_DE: 'de',
  fr_FR: 'fr',
  es_ES: 'es',
  it_IT: 'it',
  pt_PT: 'pt',
  ja_JP: 'ja',
}

export const LOCALE_CODES = new Set(Object.keys(SUPPORTED_LOCALES))

const DEFAULT_LOCALE = 'en_GB'

/** Map short lang prefix (e.g. "nl", "en") → first matching locale */
const LANG_TO_LOCALE: Record<string, string> = {}
for (const [locale, lang] of Object.entries(SUPPORTED_LOCALES)) {
  LANG_TO_LOCALE[lang] ??= locale
}

/** Parse Accept-Language header and return best matching locale */
export function detectLocale(acceptLanguage: string): string {
  const entries = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of entries) {
    // Try exact match with underscore form (e.g. "nl-nl" → "nl_NL")
    const underscored = tag.replace('-', '_')
    for (const code of LOCALE_CODES) {
      if (code.toLowerCase() === underscored) return code
    }
    // Try short prefix (e.g. "nl" → "nl_NL")
    const short = tag.split('-')[0]
    if (LANG_TO_LOCALE[short]) return LANG_TO_LOCALE[short]
  }

  return DEFAULT_LOCALE
}

/** Extract short lang code from locale (e.g. "nl_NL" → "nl") */
export function localeToLang(locale: string): string {
  return SUPPORTED_LOCALES[locale] ?? 'en'
}
