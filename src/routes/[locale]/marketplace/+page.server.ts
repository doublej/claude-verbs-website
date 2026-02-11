import authorsJson from '$lib/data/authors.json'
import { loadSets } from '$lib/data/sets'
import type { Authors } from '$lib/data/types'
import { localeToLang } from '$lib/locale'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ params }) => ({
  sets: loadSets(),
  authors: authorsJson as Authors,
  preferredLang: localeToLang(params.locale),
})
