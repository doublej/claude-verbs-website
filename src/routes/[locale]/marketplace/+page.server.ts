import authorsJson from '$lib/data/authors.json'
import { loadSets } from '$lib/data/sets'
import type { Authors } from '$lib/data/types'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => ({
  sets: loadSets(),
  authors: authorsJson as Authors,
})
