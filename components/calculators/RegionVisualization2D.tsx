"use client"

import { useEffect, useRef } from "react"
import { compileExpression2D } from "@/lib/math-expression"

interface Props {
  expression: string
  constraint?: string
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export default function RegionVisualization2D({
  expression, constraint, xMin, xMax, yMin, yMax,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fn  = compileExpression2D(expression)
  const gFn = compileExpression2D(constraint)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !fn) return
    const ctx  = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = "hsl(220,18%,10%)"
    ctx.fillRect(0, 0, W, H)

    // Sample z values
    const zGrid: number[][] = []
    let zMin = Infinity, zMax = -Infinity
    for (let px = 0; px < W; px++) {
      zGrid[px] = []
      for (let py = 0; py < H; py++) {
        const x = xMin + ((xMax - xMin) * px) / W
        const y = yMax - ((yMax - yMin) * py) / H
        const z = fn(x, y)
        zGrid[px][py] = Number.isFinite(z) ? z : 0
        if (zGrid[px][py] < zMin) zMin = zGrid[px][py]
        if (zGrid[px][py] > zMax) zMax = zGrid[px][py]
      }
    }

    const zRange = zMax - zMin || 1

    // Draw heatmap
    const imgData = ctx.createImageData(W, H)
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const t = (zGrid[px][py] - zMin) / zRange
        // Purple → Green gradient
        const r = Math.round(124 * (1 - t) + 34 * t)
        const g = Math.round(58  * (1 - t) + 197 * t)
        const b = Math.round(237 * (1 - t) + 94  * t)
        const idx = (py * W + px) * 4
        imgData.data[idx]     = r
        imgData.data[idx + 1] = g
        imgData.data[idx + 2] = b
        imgData.data[idx + 3] = 200
      }
    }
    ctx.putImageData(imgData, 0, 0)

    // Draw level curves (contours)
    const levels = 8
    ctx.strokeStyle = "rgba(255,255,255,0.25)"
    ctx.lineWidth   = 0.5
    for (let l = 1; l < levels; l++) {
      const threshold = zMin + (zRange * l) / levels
      for (let px = 0; px < W - 1; px++) {
        for (let py = 0; py < H - 1; py++) {
          const tl = zGrid[px][py]
          const tr = zGrid[px + 1][py]
          const bl = zGrid[px][py + 1]
          const br = zGrid[px + 1][py + 1]
          const above = [tl, tr, bl, br].filter((v) => v >= threshold).length
          if (above > 0 && above < 4) {
            ctx.beginPath()
            ctx.rect(px, py, 1, 1)
            ctx.stroke()
          }
        }
      }
    }

    // Draw constraint curve g(x,y) = 0
    if (gFn) {
      ctx.strokeStyle = "#f59e0b"
      ctx.lineWidth   = 2
      for (let px = 0; px < W - 1; px++) {
        for (let py = 0; py < H - 1; py++) {
          const x = xMin + ((xMax - xMin) * px) / W
          const y = yMax - ((yMax - yMin) * py) / H
          const g = gFn(x, y)
          if (!Number.isFinite(g)) continue
          if (Math.abs(g) < (xMax - xMin) / W * 2) {
            ctx.fillStyle = "#f59e0b"
            ctx.fillRect(px, py, 2, 2)
          }
        }
      }
    }

    // Axes
    const originX = Math.round((-xMin / (xMax - xMin)) * W)
    const originY = Math.round((yMax / (yMax - yMin)) * H)
    ctx.strokeStyle = "rgba(255,255,255,0.4)"
    ctx.lineWidth   = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(W, originY); ctx.stroke()
    ctx.setLineDash([])

    // Labels
    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.font = "10px monospace"
    ctx.fillText(`x: [${xMin}, ${xMax}]`, 6, H - 22)
    ctx.fillText(`y: [${yMin}, ${yMax}]`, 6, H - 8)
  }, [fn, gFn, xMin, xMax, yMin, yMax])

  return (
    <div className="grafy-card p-4 space-y-2">
      <h3 className="text-sm font-bold text-foreground">Región 2D / Curvas de Nivel</h3>
      <canvas
        ref={canvasRef}
        width={280}
        height={200}
        className="w-full rounded-md border border-border"
        style={{ imageRendering: "pixelated" }}
      />
      {constraint && (
        <p className="text-xs text-amber-400">
          — Restricción g(x,y) = 0 en naranja
        </p>
      )}
    </div>
  )
}
