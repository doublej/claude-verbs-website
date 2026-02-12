import authorsJson from '$lib/data/authors.json'
import { findSet } from '$lib/data/sets'
import type { Authors } from '$lib/data/types'
import { buildSetSeoMetadata } from '$lib/seo/og'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ params, url }) => {
  const set = findSet(params.set)
  if (!set) error(404, 'Set not found')

  const authors = authorsJson as Authors
  const seo = buildSetSeoMetadata({
    origin: url.origin,
    pathname: url.pathname,
    setName: set.name,
    displayName: set.displayName,
    description: set.description,
    verbCount: set.verbCount,
  })

  return {
    set,
    author: authors[set.github],
    origin: url.origin,
    canonicalUrl: seo.canonicalUrl,
    seo,
  }
}
