import { describe, expect, it } from 'vitest'
import { absoluteUrl, buildSetSeoMetadata } from './og'

describe('absoluteUrl', () => {
  it('normalizes origin and pathname', () => {
    expect(absoluteUrl('https://claudeverbs.example/', 'en_GB/idiot')).toBe(
      'https://claudeverbs.example/en_GB/idiot',
    )
  })
})

describe('buildSetSeoMetadata', () => {
  it('builds absolute canonical and image urls', () => {
    const meta = buildSetSeoMetadata({
      origin: 'https://claudeverbs.example',
      pathname: '/en_US/us-breaking-bad',
      setName: 'us-breaking-bad',
      displayName: 'Breaking Bad',
      description: 'Breaking Bad chemistry drama spinner verbs',
      verbCount: 50,
    })

    expect(meta.title).toBe('Breaking Bad — Claude Verbs')
    expect(meta.canonicalUrl).toBe('https://claudeverbs.example/en_US/us-breaking-bad')
    expect(meta.ogImagePath).toBe('/og/sets/us-breaking-bad.png')
    expect(meta.ogImageUrl).toBe('https://claudeverbs.example/og/sets/us-breaking-bad.png')
    expect(meta.twitterImageUrl).toBe(meta.ogImageUrl)
    expect(meta.fallbackImageUrl).toBe('https://claudeverbs.example/og/default.png')
    expect(meta.ogImageWidth).toBe(1200)
    expect(meta.ogImageHeight).toBe(630)
  })
})
