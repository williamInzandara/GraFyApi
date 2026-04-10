"use client"

import { useMemo } from "react"
import { compileExpression2D, partialX, partialY } from "@/lib/math-expression"

interface Props {
  expression: string
  constraint: string
}

interface CritPoint {
  x: number
  y: number
  z: number
  type: string
}

export default function LagrangeOptimizer({ expression, constraint }: Props) {
  const fn = compileExpression2D(expression)
  const gFn = compileExpression2D(constraint)

  const result = useMemo(() => {
    if (!fn) return null

    // Sample grid and find local min/max
    const range = 5
    const n = 40
    const step = (2 * range) / n
    const candidates: { x: number; y: number; z: number }[] = []

    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = -range + step * i
        const y = -range + step * j

        // If constraint provided, only sample near constraint = 0
        if (gFn) {
          const g = gFn(x, y)
          if (!Number.isFinite(g) || Math.abs(g) > 0.5) continue
        }

        const z = fn(x, y)
        if (!Number.isFinite(z)) continue
        candidates.push({ x, y, z })
      }
    }

    if (candidates.length === 0) return null

    const sorted = [...candidates].sort((a, b) => a.z - b.z)
    const minPt  = sorted[0]
    const maxPt  = sorted[sorted.length - 1]

    return { min: minPt, max: maxPt, count: candidates.length }
  }, [fn, gFn])

  const fmt = (n: number) => n.toFixed(4)

  return (
    <div className="grafy-card p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground">
        Optimización {gFn ? "de Lagrange" : "sin Restricción"}
      </h3>
      <p className="text-xs text-muted-foreground">
        {gFn
          ? "Extremos de f sobre la curva g(x,y) = 0"
          : "Mínimo y máximo globales encontrados por muestreo"}
      </p>

      {result ? (
        <div className="space-y-3">
          <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
            <p className="text-xs font-bold text-green-400 mb-1">Mínimo encontrado</p>
            <p className="text-xs font-mono text-green-300">
              ({fmt(result.min.x)}, {fmt(result.min.y)}) → z = {fmt(result.min.z)}
            </p>
          </div>
          <div className="rounded-md bg-purple-500/10 border border-purple-500/20 p-3">
            <p className="text-xs font-bold text-purple-400 mb-1">Máximo encontrado</p>
            <p className="text-xs font-mono text-purple-300">
              ({fmt(result.max.x)}, {fmt(result.max.y)}) → z = {fmt(result.max.z)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Puntos evaluados: {result.count}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {gFn ? "Sin puntos sobre la restricción. Ajusta g(x,y) = 0." : "Función no válida."}
        </p>
      )}
    </div>
  )
}
