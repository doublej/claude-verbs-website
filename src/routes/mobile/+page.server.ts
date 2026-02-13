import { detectLocale, localeToLang } from '$lib/locale'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ request }) => {
  const acceptLang = request.headers.get('accept-language') ?? ''
  const locale = detectLocale(acceptLang)
  return { preferredLang: localeToLang(locale) }
}
