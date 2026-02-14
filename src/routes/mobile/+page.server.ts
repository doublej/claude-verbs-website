import authorsJson from '$lib/data/authors.json'
import { loadSets } from '$lib/data/sets'
import type { Authors } from '$lib/data/types'
import { detectLocale, localeToLang } from '$lib/locale'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ request }) => {
  const acceptLang = request.headers.get('accept-language') ?? ''
  const locale = detectLocale(acceptLang)
  return {
    sets: loadSets(),
    authors: authorsJson as Authors,
    preferredLang: localeToLang(locale),
  }
}
