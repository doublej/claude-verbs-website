import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '$lib/og/template'

const DEFAULT_OG_IMAGE_PATH = '/og/default.png'

export interface BuildSetSeoInput {
  origin: string
  pathname: string
  setName: string
  displayName: string
  description: string
  verbCount: number
}

export interface SetSeoMetadata {
  title: string
  description: string
  canonicalUrl: string
  ogType: 'website'
  ogUrl: string
  ogImagePath: string
  ogImageUrl: string
  ogImageAlt: string
  ogImageWidth: number
  ogImageHeight: number
  fallbackImagePath: string
  fallbackImageUrl: string
  twitterCard: 'summary_large_image'
  twitterImageUrl: string
}

export function absoluteUrl(origin: string, pathname: string): string {
  const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${normalizedOrigin}${normalizedPath}`
}

function buildDescription(description: string, verbCount: number): string {
  return `${description} — ${verbCount} themed spinner verbs for Claude Code.`
}

function buildImageAlt(displayName: string): string {
  return `${displayName} verb set preview for Claude Verbs`
}

export function buildSetSeoMetadata(input: BuildSetSeoInput): SetSeoMetadata {
  const title = `${input.displayName} — Claude Verbs`
  const description = buildDescription(input.description, input.verbCount)
  const canonicalUrl = absoluteUrl(input.origin, input.pathname)
  const ogImagePath = `/og/sets/${encodeURIComponent(input.setName)}.png`
  const ogImageUrl = absoluteUrl(input.origin, ogImagePath)
  const fallbackImageUrl = absoluteUrl(input.origin, DEFAULT_OG_IMAGE_PATH)

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    ogUrl: canonicalUrl,
    ogImagePath,
    ogImageUrl,
    ogImageAlt: buildImageAlt(input.displayName),
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT,
    fallbackImagePath: DEFAULT_OG_IMAGE_PATH,
    fallbackImageUrl,
    twitterCard: 'summary_large_image',
    twitterImageUrl: ogImageUrl,
  }
}
