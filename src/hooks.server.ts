import { LOCALE_CODES, detectLocale } from '$lib/locale'
import type { Handle, RequestEvent } from '@sveltejs/kit'

const SKIP_PREFIXES = ['/_app/', '/favicon', '/.', '/api/', '/mobile']

const MOBILE_UA = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i

function mobileRedirect() {
  return new Response(null, { status: 302, headers: { location: '/mobile' } })
}

function shouldRedirectMobile(event: RequestEvent): boolean {
  const ua = event.request.headers.get('user-agent') ?? ''
  return MOBILE_UA.test(ua)
}

function handleLocaleRoute(event: RequestEvent, resolve: Parameters<Handle>[0]['resolve']) {
  const segments = event.url.pathname.split('/')
  const isHome = segments.length <= 3 && !segments[2]
  if (isHome && shouldRedirectMobile(event)) return mobileRedirect()
  event.locals.locale = segments[1]
  return resolve(event)
}

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url

  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return resolve(event)
  }

  const maybeLocale = pathname.split('/')[1]
  if (maybeLocale && LOCALE_CODES.has(maybeLocale)) {
    return handleLocaleRoute(event, resolve)
  }

  // Redirect mobile users hitting / straight to /mobile
  if (pathname === '/' && shouldRedirectMobile(event)) return mobileRedirect()

  // Detect locale from Accept-Language and redirect
  const acceptLang = event.request.headers.get('accept-language') ?? ''
  const locale = detectLocale(acceptLang)

  return new Response(null, {
    status: 302,
    headers: { location: `/${locale}${pathname === '/' ? '' : pathname}` },
  })
}
