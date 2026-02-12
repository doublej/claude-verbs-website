import authorsJson from '$lib/data/authors.json'
import { findSet } from '$lib/data/sets'
import type { Authors } from '$lib/data/types'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ params }) => {
  const set = findSet(params.set)
  if (!set) error(404, 'Set not found')

  const authors = authorsJson as Authors
  return { set, author: authors[set.github] }
}
