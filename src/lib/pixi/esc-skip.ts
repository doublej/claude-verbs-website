import { Container, Graphics, Text } from "pixi.js";
import { FONT_FAMILY, PALETTE } from "./constants";
import { countColumns } from "./helpers";

const DOUBLE_TAP_MS = 500;
const HOLD_MS = 1500;
const SINGLE_HOLD_MS = 50;

export interface EscSkip {
  activated: boolean;
  holding: boolean;
  progress: number;
  lastEscDown: number;
  holdStart: number;
  singleHoldStart: number;
  popup: Container;
  bar: Graphics;
  barW: number;
  barH: number;
  chW: number;
  totalBlocks: number;
}

export function createEscSkip(
  fontSize: number,
  chW: number,
  contentW: number,
  contentH: number,
): EscSkip {
  const popup = new Container({ label: "escSkipPopup" });
  popup.visible = false;

  const label = "HOLD ESC 1.5 SEC.";
  const pad = Math.round(chW * 3);
  const barW = Math.round(countColumns(label) * chW);
  const barH = Math.round(fontSize * 0.3);
  const boxW = barW + pad * 2;
  const boxH = Math.round(fontSize * 5);
  const totalBlocks = Math.floor(barW / chW);

  const shadowOff = Math.round(chW * 0.5);
  const shadow = new Graphics({ label: "escSkipShadow" });
  shadow.rect(shadowOff, shadowOff, boxW, boxH);
  shadow.fill({ color: 0x000000, alpha: 0.5 });
  popup.addChild(shadow);

  const bg = new Graphics({ label: "escSkipBg" });
  bg.rect(0, 0, boxW, boxH);
  bg.fill({ color: 0x000000, alpha: 0.9 });
  bg.stroke({ color: PALETTE.border, width: 1 });
  popup.addChild(bg);

  const txt = new Text({
    text: label,
    style: { fontFamily: FONT_FAMILY, fontSize, fill: 0xffffff },
    label: "escSkipLabel",
  });
  txt.x = pad;
  txt.y = Math.round(boxH * 0.22);
  popup.addChild(txt);

  const track = new Graphics({ label: "escSkipTrack" });
  track.rect(0, 0, barW, barH);
  track.fill({ color: PALETTE.border });
  track.x = pad;
  track.y = Math.round(boxH * 0.62);
  popup.addChild(track);

  const bar = new Graphics({ label: "escSkipBar" });
  bar.x = pad;
  bar.y = Math.round(boxH * 0.62);
  popup.addChild(bar);

  popup.x = Math.round((contentW - boxW) / 2);
  popup.y = Math.round((contentH - boxH) / 2);

  return {
    activated: false,
    holding: false,
    progress: 0,
    lastEscDown: 0,
    holdStart: 0,
    singleHoldStart: 0,
    popup,
    bar,
    barW,
    barH,
    chW,
    totalBlocks,
  };
}

/** Returns true when first activated (double-tap detected). */
export function escKeyDown(esc: EscSkip, repeat: boolean): boolean {
  const now = Date.now();
  if (!esc.activated) {
    if (!repeat && now - esc.lastEscDown < DOUBLE_TAP_MS) {
      esc.activated = true;
      esc.holding = true;
      esc.holdStart = now;
      esc.popup.visible = true;
      return true;
    }
    if (!repeat) {
      esc.lastEscDown = now;
      esc.singleHoldStart = now;
    }
    return false;
  }
  return false;
}

export function escKeyUp(esc: EscSkip): void {
  esc.singleHoldStart = 0;
  if (esc.activated) resetEsc(esc);
}

/** Returns current progress 0–1. Sets `justActivated` when a single long press promotes. */
export function tickEsc(esc: EscSkip): {
  progress: number;
  justActivated: boolean;
} {
  if (!esc.activated && esc.singleHoldStart > 0) {
    if (Date.now() - esc.singleHoldStart >= SINGLE_HOLD_MS) {
      esc.activated = true;
      esc.holding = true;
      esc.holdStart = esc.singleHoldStart;
      esc.singleHoldStart = 0;
      esc.popup.visible = true;
      esc.progress = Math.min((Date.now() - esc.holdStart) / HOLD_MS, 1);
      redrawBar(esc);
      return { progress: esc.progress, justActivated: true };
    }
  }
  if (!esc.activated || !esc.holding)
    return { progress: esc.progress, justActivated: false };
  esc.progress = Math.min((Date.now() - esc.holdStart) / HOLD_MS, 1);
  redrawBar(esc);
  return { progress: esc.progress, justActivated: false };
}

export function resetEsc(esc: EscSkip): void {
  esc.activated = false;
  esc.holding = false;
  esc.progress = 0;
  esc.singleHoldStart = 0;
  esc.popup.visible = false;
}

function redrawBar(esc: EscSkip): void {
  esc.bar.clear();
  if (esc.progress <= 0) return;
  const gap = 2;
  const filled = Math.floor(esc.totalBlocks * esc.progress);
  for (let i = 0; i < filled; i++) {
    const x = i * esc.chW;
    esc.bar.rect(x, 0, esc.chW - gap, esc.barH);
  }
  esc.bar.fill({ color: PALETTE.prompt });
}
