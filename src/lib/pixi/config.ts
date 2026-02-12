/** Timing, zoom, and sequencing configuration for the TUI animation. */
export const SEQUENCE = {
  boot: {
    charMs: 55,
    preBlinkMs: 800,
    blinkMs: 530,
    postTypeMs: 200,
    detectLineMs: 120,
    postDetectMs: 400,
  },
  zoom: {
    baseLine: { target: 0.75, durationMs: 25000 },
    bootReadyCreep: { creepTarget: 3.5, creepDurationMs: 30000 },
    focusStrength: 0.6,
    states: {
      BOOT: { zoom: 1.6, focusY: "prompt" as const, durationMs: 2500 },
      IDLE: { zoom: 1.4, focusY: "prompt" as const, durationMs: 2500 },
      BROWSING: { zoom: 1.1, focusY: "prompt" as const, durationMs: 2500 },
      DEMO: { zoom: 1.1, focusY: "prompt" as const, durationMs: 2500 },
      POST_DEMO: { zoom: 1.1, focusY: "prompt" as const, durationMs: 2500 },
      BUGGED: { zoom: 1, focusY: "prompt" as const, durationMs: 2500 },
      BOOT_READY: { zoom: 1, focusY: "prompt" as const, durationMs: 2500 },
    },
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
  demo: { stateDiagramMs: 30000, promoMs: 45000 },
};
