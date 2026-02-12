type Theme = 'light' | 'dark'

let theme = $state<Theme>('light')
let wasDetected = $state(false)

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(t: Theme): void {
  document.documentElement.setAttribute('data-theme', t)
}

function initTheme(): void {
  if (typeof window === 'undefined') return

  const stored = localStorage.getItem('theme') as Theme | null
  if (stored) {
    theme = stored
  } else {
    theme = getSystemTheme()
    wasDetected = true
  }
  applyTheme(theme)
}

export function getTheme(): Theme {
  return theme
}

export function getResolvedTheme(): Theme {
  return theme
}

export function getWasDetected(): boolean {
  return wasDetected
}

export function clearDetected(): void {
  wasDetected = false
}

export function setTheme(newTheme: Theme): void {
  theme = newTheme
  localStorage.setItem('theme', newTheme)
  applyTheme(newTheme)
}

if (typeof window !== 'undefined') {
  initTheme()
}
