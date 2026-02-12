import type { Container } from "pixi.js";

export interface BreathingState {
  enabled: boolean;
  phase: number;
}

export const BREATHING_DEFAULTS = {
  amplitude: 0.025,
  periodMs: 20000,
} as const;

export function createBreathingState(): BreathingState {
  return { enabled: true, phase: Math.random() * Math.PI * 2 };
}

export function tickBreathing(
  state: BreathingState,
  container: Container,
  now: number,
  screenW: number,
  screenH: number,
): void {
  if (!state.enabled) return;

  const t = (now % BREATHING_DEFAULTS.periodMs) / BREATHING_DEFAULTS.periodMs;
  const wave = Math.sin(t * Math.PI * 2 + state.phase);
  const scale = 1 + wave * BREATHING_DEFAULTS.amplitude;

  container.pivot.set(screenW / 2, screenH / 2);
  container.position.set(screenW / 2, screenH / 2);
  container.scale.set(scale);
}
