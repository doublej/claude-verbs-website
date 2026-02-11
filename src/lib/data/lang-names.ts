const LANG_NAMES: Record<string, string> = {
  nl: 'Nederlands',
  en: 'English',
  de: 'Deutsch',
  fr: 'Fran\u00e7ais',
  es: 'Espa\u00f1ol',
  it: 'Italiano',
  pt: 'Portugu\u00eas',
  ja: '\u65e5\u672c\u8a9e',
}

export function langName(code: string): string {
  return LANG_NAMES[code] || code.toUpperCase()
}
