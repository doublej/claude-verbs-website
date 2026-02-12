/** Timing, zoom, and sequencing configuration for the TUI animation. */

export type FocusTarget =
  | "center"
  | "prompt"
  | "spinner"
  | "bootHint"
  | "header"
  | { line: number; char?: number };

/** Numeric Params keys that can be tweened per-state transition. */
export type TweenableKey =
  | "scale"
  | "brightness"
  | "saturation"
  | "exposure"
  | "bloomStrength";

export const TWEENABLE_KEYS: TweenableKey[] = [
  "scale",
  "brightness",
  "saturation",
  "exposure",
  "bloomStrength",
];

export interface StateConfig {
  zoom: number;
  scale: number;
  brightness: number;
  saturation: number;
  exposure: number;
  bloomStrength: number;
  focusY: FocusTarget;
  focusStrength: number;
  durationMs: number;
  showInput: boolean;
  showSpinner: boolean;
  showMeta: boolean;
}

type PartialStateConfig = Partial<StateConfig>;

export const SEQUENCE = {
  boot: {
    charMs: 55,
    preBlinkMs: 800,
    blinkMs: 530,
    postTypeMs: 200,
    detectLineMs: 120,
    postDetectMs: 400,
  },
  scrollOffset: 0,
  zoom: {
    initial: 1,
    baseLine: { target: 1.5, durationMs: 0 },
    states: {
      INTRO: {
        zoom: 1.5,
        focusY: { line: 10, char: 40 },
        focusStrength: 0.5,
        durationMs: 2500,
        showInput: true,
        showSpinner: false,
        showMeta: false,
        scale: 1,
        brightness: 1,
        saturation: 1,
        exposure: 1,
        bloomStrength: 2,
      },
      INTRO_READY: {
        focusY: { line: 24, char: 36 } as FocusTarget,
        showMeta: true,
        durationMs: 0,
      },
      IDLE: {},
      BROWSING: {},
      DEMO: { showSpinner: true },
      POST_DEMO: {
        focusY: { line: 41, char: 66 } as FocusTarget,
        scale: 3,
        showInput: true,
        showSpinner: true,
        showMeta: false,
        exposure: 2,
        brightness: 0.4,
        durationMs: 2500,
      },
      BUGGED: {},
      ESC_COUNTDOWN: {
        durationMs: 0,
        scale: 1,
        brightness: 1,
        saturation: 1,
        exposure: 1,
        bloomStrength: 2,
      },
    } satisfies Record<string, PartialStateConfig>,
  },
  burst: {
    action: 100,
    bash: 120,
    diff: 80,
    panel: 60,
    error: 100,
    mode: 150,
    diagram: 40,
    promo: 40,
  },
  demo: { stateDiagramMs: 20000, promoMs: 30000 },
};

export type StateKey = keyof typeof SEQUENCE.zoom.states;

/** Map State enum → config key. Import State lazily to avoid circular deps. */
const STATE_KEYS: StateKey[] = [
  "INTRO", // 0
  "INTRO_READY", // 1
  "IDLE", // 2
  "BROWSING", // 3
  "DEMO", // 4
  "POST_DEMO", // 5
  "BUGGED", // 6
  "ESC_COUNTDOWN", // 7
];

/** Resolved configs: each state inherits unset fields from the previous one. */
const resolvedStates: StateConfig[] = STATE_KEYS.reduce<StateConfig[]>(
  (acc, key, i) => {
    const partial = SEQUENCE.zoom.states[key];
    const prev = i > 0 ? acc[i - 1] : ({} as StateConfig);
    acc.push({ ...prev, ...partial });
    return acc;
  },
  [],
);

export function stateConfig(state: number): StateConfig {
  return resolvedStates[state];
}
