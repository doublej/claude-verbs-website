import { LOCALE_CODES, detectLocale } from '$lib/locale'
import type { Handle } from '@sveltejs/kit'

const SKIP_PREFIXES = ['/_app/', '/favicon', '/.', '/api/']

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url

  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return resolve(event)
  }

  // Check if path already has a valid locale prefix
  const segments = pathname.split('/')
  const maybeLocale = segments[1]

  if (maybeLocale && LOCALE_CODES.has(maybeLocale)) {
    event.locals.locale = maybeLocale
    return resolve(event)
  }

  // Detect locale from Accept-Language and redirect
  const acceptLang = event.request.headers.get('accept-language') ?? ''
  const locale = detectLocale(acceptLang)

  return new Response(null, {
    status: 302,
    headers: { location: `/${locale}${pathname === '/' ? '' : pathname}` },
  })
}
