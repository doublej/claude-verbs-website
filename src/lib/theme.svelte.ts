type Theme = 'light' | 'dark' | 'system'

let theme = $state<Theme>('light')

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(t: Theme): 'light' | 'dark' {
  return t === 'system' ? getSystemTheme() : t
}

function applyTheme(t: Theme): void {
  const resolved = resolveTheme(t)
  document.documentElement.setAttribute('data-theme', resolved)
}

function initTheme(): void {
  if (typeof window === 'undefined') return

  const stored = localStorage.getItem('theme') as Theme | null
  theme = stored ?? 'light'
  applyTheme(theme)

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (theme === 'system') applyTheme('system')
  })
}

export function getTheme(): Theme {
  return theme
}

export function getResolvedTheme(): 'light' | 'dark' {
  return resolveTheme(theme)
}

export function setTheme(newTheme: Theme): void {
  theme = newTheme
  localStorage.setItem('theme', newTheme)
  applyTheme(newTheme)
}

if (typeof window !== 'undefined') {
  initTheme()
}
