"use client"

import { useState, useMemo } from "react"
import { compileExpression2D } from "@/lib/math-expression"

interface Props { expression: string }

const DIRECTIONS = [
  { label: "x→0⁺, y→0⁺", dx:  1e-6, dy:  1e-6 },
  { label: "x→0⁻, y→0⁺", dx: -1e-6, dy:  1e-6 },
  { label: "x→0⁺, y→0⁻", dx:  1e-6, dy: -1e-6 },
  { label: "x→0⁻, y→0⁻", dx: -1e-6, dy: -1e-6 },
  { label: "y = x",        dx:  1e-6, dy:  1e-6 },
  { label: "y = -x",       dx:  1e-6, dy: -1e-6 },
]

export default function LimitsCalculator({ expression }: Props) {
  const [px, setPx] = useState("0")
  const [py, setPy] = useState("0")

  const fn = compileExpression2D(expression)
  const x0 = parseFloat(px) || 0
  const y0 = parseFloat(py) || 0

  const results = useMemo(() => {
    if (!fn) return []
    return DIRECTIONS.map(({ label, dx, dy }) => {
      const val = fn(x0 + dx, y0 + dy)
      return {
        label,
        value: Number.isFinite(val) ? val.toFixed(6) : "∞ / indefinido",
      }
    })
  }, [fn, x0, y0])

  const allClose = results.length > 0 &&
    results.every((r) => Math.abs(parseFloat(r.value) - parseFloat(results[0].value)) < 1e-3)

  return (
    <div className="grafy-card p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Análisis de Límites</h3>
      <p className="text-xs text-muted-foreground">
        Aproximación numérica del límite lim f(x,y) cuando (x,y)→(x₀,y₀)
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">x₀</label>
          <input value={px} onChange={(e) => setPx(e.target.value)}
            type="number" step="0.1"
            className="grafy-input w-full px-2 py-1.5 text-sm font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">y₀</label>
          <input value={py} onChange={(e) => setPy(e.target.value)}
            type="number" step="0.1"
            className="grafy-input w-full px-2 py-1.5 text-sm font-mono" />
        </div>
      </div>

      <div className="space-y-1">
        {results.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-1 border-b border-border last:border-0">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-mono font-semibold text-secondary">{value}</span>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className={`text-xs px-3 py-2 rounded-md font-semibold ${
          allClose
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {allClose
            ? `✓ Límite existe ≈ ${results[0].value}`
            : "✗ El límite no existe (varía por dirección)"}
        </div>
      )}
    </div>
  )
}
