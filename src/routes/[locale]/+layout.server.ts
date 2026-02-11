import { LOCALE_CODES } from '$lib/locale'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ params }) => {
  if (!LOCALE_CODES.has(params.locale)) {
    error(404, 'Unknown locale')
  }
  return { locale: params.locale }
}
