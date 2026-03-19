import { DEFAULT_COLOR } from "./constant";
import { clamp } from "./helper";
import { OklchColor } from "./types";
import { formatHex, oklch as toOklch, parse } from "culori";

export function oklchToHex(l: number, c: number, h: number): string {
  return formatHex({ mode: "oklch", l, c, h }) ?? "#000000";
}

export function parseOklchStr(str: string | undefined): OklchColor {
  if (!str) return DEFAULT_COLOR;
  try {
    const parsed = parse(str);
    if (!parsed) return DEFAULT_COLOR;
    const converted = toOklch(parsed);
    if (!converted) return DEFAULT_COLOR;
    const l = converted.l ?? 0.5;
    const c = converted.c ?? 0;
    // Achromatic colors have no hue (undefined/NaN from culori) — keep as 0.
    const h =
      converted.h != null && !Number.isNaN(converted.h) ? converted.h : 0;
    return { l, c, h, a: converted.alpha ?? 1, hexInput: oklchToHex(l, c, h) };
  } catch {
    return DEFAULT_COLOR;
  }
}

export function buildOklchStr(
  l: number,
  c: number,
  h: number,
  a: number,
): string {
  // Guard every channel against NaN/Infinity — validators reject those.
  const safeL = Number.isFinite(l) ? clamp(l, 0, 1) : 0;
  const safeC = Number.isFinite(c) ? clamp(c, 0, 0.4) : 0;
  // Hue is meaningless (and culori returns NaN/undefined) for achromatic colors;
  // also normalise any out-of-range value into [0, 360).
  const safeH =
    safeC === 0 || !Number.isFinite(h) || Number.isNaN(h)
      ? 0
      : ((h % 360) + 360) % 360;
  const safeA = Number.isFinite(a) ? clamp(a, 0, 1) : 1;

  const lS = safeL.toFixed(3);
  const cS = safeC.toFixed(3);
  const hS = safeH.toFixed(1);
  return safeA < 0.999
    ? `oklch(${lS} ${cS} ${hS} / ${safeA.toFixed(2)})`
    : `oklch(${lS} ${cS} ${hS})`;
}
