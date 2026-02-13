export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const THEME_ATTR = 'data-theme'
const MODE_ATTR = 'data-theme-mode'
const READY_ATTR = 'data-theme-ready'
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

let theme = $state<Theme>('system')
let resolvedTheme = $state<ResolvedTheme>('dark')
let wasDetected = $state(false)
let initialized = false

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

function persistTheme(nextTheme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, nextTheme)
  } catch {
    // Ignore storage failures (private mode, strict privacy settings).
  }
}

function applyResolvedTheme(nextResolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute(THEME_ATTR, nextResolvedTheme)
  document.documentElement.style.colorScheme = nextResolvedTheme
}

function applyThemeMode(nextTheme: Theme): void {
  theme = nextTheme
  resolvedTheme = nextTheme === 'system' ? getSystemTheme() : nextTheme
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute(MODE_ATTR, nextTheme)
    applyResolvedTheme(resolvedTheme)
  }
}

function enableTransitionsAfterFirstPaint(): void {
  if (typeof window === 'undefined') return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.setAttribute(READY_ATTR, 'true')
    })
  })
}

function syncSystemTheme(): void {
  if (theme !== 'system') return
  const nextResolvedTheme = getSystemTheme()
  if (nextResolvedTheme === resolvedTheme) return
  resolvedTheme = nextResolvedTheme
  applyResolvedTheme(nextResolvedTheme)
}

function setupSystemListener(): void {
  if (typeof window === 'undefined') return
  const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY)
  mediaQuery.addEventListener('change', syncSystemTheme)
}

function initTheme(): void {
  if (typeof window === 'undefined' || initialized) return
  initialized = true
  setupSystemListener()

  const stored = getStoredTheme()
  if (stored) {
    applyThemeMode(stored)
  } else {
    wasDetected = true
    applyThemeMode('system')
  }
  enableTransitionsAfterFirstPaint()
}

export function getTheme(): Theme {
  return theme
}

export function getResolvedTheme(): ResolvedTheme {
  return resolvedTheme
}

export function getWasDetected(): boolean {
  return wasDetected
}

export function clearDetected(): void {
  wasDetected = false
}

export function setTheme(newTheme: Theme): void {
  applyThemeMode(newTheme)
  persistTheme(newTheme)
}

if (typeof window !== 'undefined') initTheme()
