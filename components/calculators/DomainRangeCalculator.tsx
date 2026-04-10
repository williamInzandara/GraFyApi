"use client"

import { useMemo } from "react"
import { compileExpression2D } from "@/lib/math-expression"

interface Props {
  expression: string
  range: number
  resolution: number
}

export default function DomainRangeCalculator({ expression, range, resolution }: Props) {
  const fn = compileExpression2D(expression)

  const stats = useMemo(() => {
    if (!fn) return null
    const step = (2 * range) / Math.min(resolution, 80)
    let zMin = Infinity, zMax = -Infinity, zSum = 0, count = 0

    for (let i = 0; i <= 80; i++) {
      for (let j = 0; j <= 80; j++) {
        const x = -range + (2 * range * i) / 80
        const y = -range + (2 * range * j) / 80
        const z = fn(x, y)
        if (!Number.isFinite(z)) continue
        if (z < zMin) zMin = z
        if (z > zMax) zMax = z
        zSum += z
        count++
      }
    }

    if (count === 0) return null
    return {
      zMin: zMin.toFixed(4),
      zMax: zMax.toFixed(4),
      mean: (zSum / count).toFixed(4),
      range: (zMax - zMin).toFixed(4),
    }
  }, [fn, range, resolution])

  return (
    <div className="grafy-card p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Dominio y Rango</h3>
      <p className="text-xs text-muted-foreground">
        Muestreo numérico en [{-range}, {range}] × [{-range}, {range}]
      </p>

      {stats ? (
        <div className="space-y-1.5">
          {[
            { label: "Dominio (x,y)",  value: `[${-range}, ${range}] × [${-range}, ${range}]` },
            { label: "z mínimo",       value: stats.zMin },
            { label: "z máximo",       value: stats.zMax },
            { label: "z promedio",     value: stats.mean },
            { label: "Rango total Δz", value: stats.range },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-1 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-mono font-semibold text-primary">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-red-400">No se pudo evaluar la función.</p>
      )}
    </div>
  )
}
