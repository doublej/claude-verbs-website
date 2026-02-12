export const SPINNER_FRAMES = ["·", "✻", "✽", "✶", "✳", "✢"];
export const SPINNER_TIMELINE = [0, 0, 1, 2, 3, 4, 5, 5];
export const FONT_FAMILY = '"SF Mono", "Fira Code", "Cascadia Code", monospace';

function isLight(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-theme") === "light";
}

const LIGHT_PALETTE = {
  border: 0xd0d7de,
  dim: 0x6e7781,
  lineNum: 0x9ca3af,
  tool: 0x57606a,
  path: 0x24292f,
  ok: 0x22c55e,
  warn: 0xd97706,
  error: 0xdc2626,
  prompt: 0x7c3aed,
  accent: 0x0969da,
  suggestion: 0x8b8b8b,
  active: 0x000000,
  deadPixel: "#d0d0d0",
  deadPixelRed: "#e8a0a0",
  deadPixelBlue: "#a0a0e8",
  deadPixelGreen: "#a0e8a0",
} as const;

const DARK_PALETTE = {
  border: 0x30363d,
  dim: 0x6e7681,
  lineNum: 0x484f58,
  tool: 0x8b949e,
  path: 0xc9d1d9,
  ok: 0x4ade80,
  warn: 0xd29922,
  error: 0xf85149,
  prompt: 0xbc8cff,
  accent: 0x79c0ff,
  suggestion: 0x555555,
  active: 0xffffff,
  deadPixel: "#0a0c10",
  deadPixelRed: "#3a0808",
  deadPixelBlue: "#08083a",
  deadPixelGreen: "#083a08",
} as const;

/** Cached palette — call `refreshPalette()` if theme changes at runtime. */
export let PALETTE = isLight() ? { ...LIGHT_PALETTE } : { ...DARK_PALETTE };

export function refreshPalette(): void {
  PALETTE = isLight() ? { ...LIGHT_PALETTE } : { ...DARK_PALETTE };
}

export const LAYOUT = {
  lineHeightRatio: 1.24,
  headerLeftCol: 38,
  panelWidth: 34,
  textPoolCap: 40,
  defaultCol: 3,
};

export const CAMERA_DEFAULTS = {
  gridDivisions: 32,
  perspective: 3000,
  rotateX: 5,
  rotateY: 8,
  rotateZ: -4,
  originX: 4.8,
  originY: 5.3,
};

export const MOUSE_DEFAULTS = {
  translateRange: 1.2,
  zoomFactor: 0.016,
  lerpFactor: 0.02,
};

export const EFFECT_DEFAULTS = {
  deadPixelCount: 12,
  deadPixelSize: 3,
  lcdGrid: 4.0,
};
