export const SPINNER_FRAMES = ['\u00b7', '\u273b', '\u273d', '\u2736', '\u2733', '\u2722']
export const SPINNER_TIMELINE = [0, 0, 1, 2, 3, 4, 5, 5]
export const FONT_FAMILY = '"SF Mono", "Fira Code", "Cascadia Code", monospace'

type Theme = 'light' | 'dark'

function getTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' ? 'light' : 'dark'
}

const theme = getTheme()
const isLight = theme === 'light'

export const C_TOOL = isLight ? 0x57606a : 0x8b949e
export const C_PATH = isLight ? 0x24292f : 0xc9d1d9
export const C_OK = isLight ? 0x22c55e : 0x4ade80
export const C_OUT = isLight ? 0x6e7781 : 0x6e7681
export const C_WARN = isLight ? 0xd97706 : 0xd29922
export const C_ERR = isLight ? 0xdc2626 : 0xf85149
export const C_PROMPT = isLight ? 0x7c3aed : 0xbc8cff
export const C_BORDER = isLight ? 0xd0d7de : 0x30363d
export const C_LINENUM = isLight ? 0x9ca3af : 0x484f58
export const C_ACCENT = isLight ? 0x0969da : 0x79c0ff
export const C_RULE = isLight ? 0xd0d7de : 0x30363d
export const C_DIM = isLight ? 0x6e7781 : 0x6e7681
export const C_PERMS = isLight ? 0xd97706 : 0xd29922
export const COLOR_SUGGESTION = isLight ? 0xaaaaaa : 0x555555
export const COLOR_ACTIVE = isLight ? 0x000000 : 0xffffff
