"use client"

import { useState } from "react"
import { compileExpression2D, partialX, partialY } from "@/lib/math-expression"

interface Props { expression: string }

export default function PartialDerivativesCalculator({ expression }: Props) {
  const [px, setPx] = useState("0")
  const [py, setPy] = useState("0")

  const fn = compileExpression2D(expression)
  const x  = parseFloat(px) || 0
  const y  = parseFloat(py) || 0

  const dx = fn ? partialX(fn, x, y).toFixed(6) : "—"
  const dy = fn ? partialY(fn, x, y).toFixed(6) : "—"
  const z  = fn ? fn(x, y).toFixed(6)           : "—"

  return (
    <div className="grafy-card p-4 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Derivadas Parciales</h3>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Punto x₀</label>
          <input value={px} onChange={(e) => setPx(e.target.value)}
            className="grafy-input w-full px-2 py-1.5 text-sm font-mono"
            placeholder="0" type="number" step="0.1" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Punto y₀</label>
          <input value={py} onChange={(e) => setPy(e.target.value)}
            className="grafy-input w-full px-2 py-1.5 text-sm font-mono"
            placeholder="0" type="number" step="0.1" />
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {[
          { label: "f(x₀, y₀)",      value: z  },
          { label: "∂f/∂x en (x₀,y₀)", value: dx },
          { label: "∂f/∂y en (x₀,y₀)", value: dy },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
            <span className="text-xs text-muted-foreground font-mono">{label}</span>
            <span className="text-xs font-mono font-semibold text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
