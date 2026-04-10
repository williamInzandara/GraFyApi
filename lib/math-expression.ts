/* ================================================================
   math-expression.ts — Safe Math Expression Compiler
   graFyApi · Proyecto de Portafolio
   ================================================================ */

export type FnXYT = (x: number, y: number, t: number) => number
export type FnXY  = (x: number, y: number) => number

// Map user-friendly names → Math.*
const FN_MAP: Record<string, string> = {
  sin: "Math.sin", cos: "Math.cos", tan: "Math.tan",
  asin: "Math.asin", acos: "Math.acos", atan: "Math.atan", atan2: "Math.atan2",
  sqrt: "Math.sqrt", cbrt: "Math.cbrt", abs: "Math.abs",
  pow: "Math.pow", exp: "Math.exp", log: "Math.log", ln: "Math.log",
  log2: "Math.log2", log10: "Math.log10",
  min: "Math.min", max: "Math.max",
  floor: "Math.floor", ceil: "Math.ceil", round: "Math.round", trunc: "Math.trunc",
  sinh: "Math.sinh", cosh: "Math.cosh", tanh: "Math.tanh",
  hypot: "Math.hypot", sign: "Math.sign",
}

const CONST_MAP: Record<string, string> = {
  pi:  "Math.PI",
  tau: "(Math.PI*2)",
  e:   "Math.E",
}

function sanitize(expr: string): string {
  if (!expr.trim()) return "0"

  // Replace ^ with **
  let s = expr.replace(/\^/g, "**")

  // Replace constants
  s = s.replace(/\b(pi|tau|e)\b/gi, (m) => CONST_MAP[m.toLowerCase()] ?? m)

  // Replace math functions
  const fnPattern = new RegExp(
    `\\b(${Object.keys(FN_MAP).join("|")})\\b`,
    "gi"
  )
  s = s.replace(fnPattern, (m) => FN_MAP[m.toLowerCase()] ?? m)

  return s
}

function safeWrap3D(fn: FnXYT): FnXYT {
  return (x, y, t) => {
    try {
      const v = fn(x, y, t)
      const n = Number(v)
      return Number.isFinite(n) ? n : NaN
    } catch {
      return NaN
    }
  }
}

function safeWrap2D(fn: FnXY): FnXY {
  return (x, y) => {
    try {
      const v = fn(x, y)
      const n = Number(v)
      return Number.isFinite(n) ? n : NaN
    } catch {
      return NaN
    }
  }
}

export function compileExpression3D(expr: string): FnXYT {
  const safe = sanitize(expr)
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("x", "y", "t", `"use strict"; return (${safe});`) as FnXYT
    return safeWrap3D(fn)
  } catch {
    return () => NaN
  }
}

export function compileExpression2D(expr: string | undefined): FnXY | null {
  if (!expr?.trim()) return null
  const safe = sanitize(expr)
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("x", "y", `"use strict"; return (${safe});`) as FnXY
    return safeWrap2D(fn)
  } catch {
    return null
  }
}

/* ── Numerical Utilities ──────────────────────────────── */

/** Finite difference partial derivative ∂f/∂x */
export function partialX(fn: FnXY, x: number, y: number, h = 1e-4): number {
  return (fn(x + h, y) - fn(x - h, y)) / (2 * h)
}

/** Finite difference partial derivative ∂f/∂y */
export function partialY(fn: FnXY, x: number, y: number, h = 1e-4): number {
  return (fn(x, y + h) - fn(x, y - h)) / (2 * h)
}

/** Gradient vector [∂f/∂x, ∂f/∂y] */
export function gradient(fn: FnXY, x: number, y: number, h = 1e-4): [number, number] {
  return [partialX(fn, x, y, h), partialY(fn, x, y, h)]
}
