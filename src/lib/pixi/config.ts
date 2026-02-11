/** Timing, zoom, and sequencing configuration for the TUI animation. */
export const SEQUENCE = {
  boot: { charMs: 55, preBlinkMs: 800, blinkMs: 530, postTypeMs: 200, loadMs: 1500 },
  zoom: {
    baseLine: { target: 0.75, durationMs: 25000 },
    focusStrength: 0.6,
    states: {
      BOOT: { zoom: 1.6, focusY: 'center' as const, durationMs: 200 },
      IDLE: { zoom: 1.0, focusY: 'prompt' as const, durationMs: 300 },
      BROWSING: { zoom: 1.35, focusY: 'prompt' as const, durationMs: 180 },
      DEMO: { zoom: 0.8, focusY: 'spinner' as const, durationMs: 250 },
      POST_DEMO: { zoom: 1.15, focusY: 'prompt' as const, durationMs: 200 },
      BUGGED: { zoom: 0.65, focusY: 'center' as const, durationMs: 100 },
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
}
