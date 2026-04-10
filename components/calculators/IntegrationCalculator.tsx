"use client"

import { useMemo } from "react"
import { compileExpression2D } from "@/lib/math-expression"

interface Props {
  expression: string
  density?: string
}

/** Monte Carlo double integral over [-R,R]×[-R,R] */
function monteCarloIntegral(
  fn: (x: number, y: number) => number,
  range: number,
  samples: number
): number {
  const area = (2 * range) ** 2
  let sum = 0
  for (let i = 0; i < samples; i++) {
    const x = -range + Math.random() * 2 * range
    const y = -range + Math.random() * 2 * range
    const v = fn(x, y)
    if (Number.isFinite(v)) sum += v
  }
  return (sum / samples) * area
}

/** Riemann sum double integral */
function riemannIntegral(
  fn: (x: number, y: number) => number,
  range: number,
  n: number
): number {
  const h = (2 * range) / n
  let sum = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = -range + h * (i + 0.5)
      const y = -range + h * (j + 0.5)
      const v = fn(x, y)
      if (Number.isFinite(v)) sum += v
    }
  }
  return sum * h * h
}

export default function IntegrationCalculator({ expression, density }: Props) {
  const fn = compileExpression2D(expression)
  const dFn = compileExpression2D(density)

  const results = useMemo(() => {
    if (!fn) return null

    const integrand = dFn
      ? (x: number, y: number) => fn(x, y) * dFn(x, y)
      : fn

    const range   = 4
    const riemann = riemannIntegral(integrand, range, 60)
    const monte   = monteCarloIntegral(integrand, range, 40000)

    return {
      riemann: riemann.toFixed(5),
      monte:   monte.toFixed(5),
      avg:     ((riemann + monte) / 2).toFixed(5),
      domain: `[-${range},${range}]`,
    }
  }, [fn, dFn])

  return (
    <div className="grafy-card p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Integración Doble</h3>
      <p className="text-xs text-muted-foreground">
        ∬ f(x,y) {dFn ? "· σ(x,y)" : ""} dA sobre {results?.domain ?? "[-4,4]²"}
      </p>

      {results ? (
        <div className="space-y-1.5">
          {[
            { label: "Sumas de Riemann (60×60)", value: results.riemann },
            { label: "Monte Carlo (40 000 pts)",  value: results.monte   },
            { label: "Estimación promedio",        value: results.avg     },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-mono font-semibold text-accent">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-red-400">Función no válida.</p>
      )}
    </div>
  )
}
