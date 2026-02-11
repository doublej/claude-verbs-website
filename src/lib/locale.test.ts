import { describe, expect, it } from 'vitest'
import { detectLocale, localeToLang } from './locale'

describe('detectLocale', () => {
  it('returns nl_NL for Dutch', () => {
    expect(detectLocale('nl')).toBe('nl_NL')
    expect(detectLocale('nl-NL,nl;q=0.9,en;q=0.8')).toBe('nl_NL')
  })

  it('returns en_GB for English', () => {
    expect(detectLocale('en-GB,en;q=0.9')).toBe('en_GB')
    expect(detectLocale('en')).toBe('en_GB')
  })

  it('returns ja_JP for Japanese', () => {
    expect(detectLocale('ja')).toBe('ja_JP')
  })

  it('falls back to en_GB for unknown languages', () => {
    expect(detectLocale('zh-CN')).toBe('en_GB')
    expect(detectLocale('')).toBe('en_GB')
  })

  it('picks highest-quality match', () => {
    expect(detectLocale('zh-CN;q=0.9,nl;q=0.8')).toBe('nl_NL')
  })
})

describe('localeToLang', () => {
  it('maps locale to short lang code', () => {
    expect(localeToLang('nl_NL')).toBe('nl')
    expect(localeToLang('en_GB')).toBe('en')
    expect(localeToLang('ja_JP')).toBe('ja')
  })

  it('falls back to en for unknown locale', () => {
    expect(localeToLang('xx_XX')).toBe('en')
  })
})
