"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import {
  Activity, Box, Orbit, TrendingUp,
  Zap, Settings2, Sparkles, ChevronRight,
} from "lucide-react"
import DomainRangeCalculator        from "@/components/calculators/DomainRangeCalculator"
import LimitsCalculator              from "@/components/calculators/LimitsCalculator"
import PartialDerivativesCalculator  from "@/components/calculators/PartialDerivativesCalculator"
import LagrangeOptimizer             from "@/components/calculators/LagrangeOptimizer"
import IntegrationCalculator         from "@/components/calculators/IntegrationCalculator"
import RegionVisualization2D         from "@/components/calculators/RegionVisualization2D"
import { compileExpression3D, type FnXYT } from "@/lib/math-expression"

// All Three.js components loaded client-side only (WebGL = browser only)
const SurfaceDraggable    = dynamic(() => import("@/components/surface/SurfaceDraggable"),    { ssr: false })
const GradientField3D     = dynamic(() => import("@/components/surface/GradientField3D"),     { ssr: false })
const SurfaceInspector    = dynamic(() => import("@/components/surface/SurfaceInspector"),    { ssr: false })
const SurfaceIntersection = dynamic(() => import("@/components/surface/SurfaceIntersection"), { ssr: false })

/* ── Types ────────────────────────────────────────────────── */
type Viewer = "draggable" | "gradient" | "inspector" | "intersection"

/* ── Preset Surfaces ──────────────────────────────────────── */
const PRESETS = [
  { name: "Onda Ondulante",          expr: "sin(sqrt(x*x+y*y)-t*3)/(1+sqrt(x*x+y*y)/4)", icon: "🌊" },
  { name: "Paraboloide Hiperbólico", expr: "x*x - y*y",                                   icon: "🥨" },
  { name: "Pico Gaussiano",          expr: "3*exp(-(x*x+y*y)/4)*cos(t*2)",                icon: "⛰️" },
  { name: "Superficie Retorcida",    expr: "sin(x)*cos(y)+0.3*sin(t*2)",                  icon: "🌀" },
  { name: "Sombrero Mexicano",       expr: "sin(sqrt(x*x+y*y))/sqrt(x*x+y*y+0.1)",       icon: "🎩" },
  { name: "Silla de Mono",           expr: "x*x*x-3*x*y*y",                               icon: "🐵" },
  { name: "Cartón de Huevos",        expr: "sin(x)*sin(y)",                                icon: "🥚" },
  { name: "Corte de Toro",           expr: "sin(sqrt((sqrt(x*x+y*y)-2)**2))*cos(t)",      icon: "🍩" },
]

/* ── Loader ───────────────────────────────────────────────── */
function Loader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background">
      <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Cargando visualizador 3D…</p>
    </div>
  )
}

/* ── Slider Row ───────────────────────────────────────────── */
function SliderRow({
  label, value, min, max, step, badge,
  onChange,
}: {
  label: string; value: number; min: number; max: number
  step: number; badge: string; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="grafy-badge">{badge}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="grafy-slider w-full"
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN APP COMPONENT
══════════════════════════════════════════════════════════ */
export default function App() {
  /* ── State ─────────────────────────────────────────────── */
  const [expr, setExpr]                 = useState("sin(sqrt(x*x+y*y)-t*3)/(1+sqrt(x*x+y*y)/4)")
  const [range, setRange]               = useState(4)
  const [resolution, setResolution]     = useState(50)
  const [density, setDensity]           = useState("1")
  const [constraint, setConstraint]     = useState("")
  const [viewer, setViewer]             = useState<Viewer>("draggable")
  const [vectors, setVectors]           = useState(18)
  const [vectorScale, setVectorScale]   = useState(0.55)
  const [tParam, setTParam]             = useState(0)

  const compiledFn   = useMemo<FnXYT>(() => compileExpression3D(expr), [expr])
  const meshSegments = useMemo(() => 80 + Math.round(resolution * 1.2), [resolution])

  /* ── Viewer buttons config ──────────────────────────────── */
  const viewerBtns: {
    id: Viewer; label: string; Icon: React.ElementType
    active: string; inactive: string
  }[] = [
    {
      id: "draggable", label: "Interactivo", Icon: Orbit,
      active:   "bg-primary/20 border-primary text-primary",
      inactive: "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground",
    },
    {
      id: "gradient", label: "Gradiente", Icon: TrendingUp,
      active:   "bg-secondary/20 border-secondary text-secondary",
      inactive: "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground",
    },
    {
      id: "inspector", label: "Análisis", Icon: Settings2,
      active:   "bg-accent/20 border-accent text-accent",
      inactive: "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground",
    },
    {
      id: "intersection", label: "Intersección", Icon: Box,
      active:   "bg-purple-500/20 border-purple-500 text-purple-400",
      inactive: "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground",
    },
  ]

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ══════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════ */}
      <aside className="w-[360px] shrink-0 flex flex-col border-r border-border bg-card overflow-hidden">

        {/* Header */}
        <div className="grafy-header px-6 py-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center grafy-glow">
              <Activity className="w-5 h-5 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
                graFy<span className="text-primary">Api</span>
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">Cálculo Multivariable · 3D</p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* ── Visualization Mode ─────────────────────── */}
          <section className="space-y-2.5">
            <p className="grafy-section-title">Modo de Visualización</p>
            <div className="grid grid-cols-2 gap-2">
              {viewerBtns.map(({ id, label, Icon, active, inactive }) => (
                <button
                  key={id}
                  onClick={() => setViewer(id)}
                  className={`grafy-mode-btn p-3.5 rounded-lg flex flex-col items-start gap-1.5 border-2 ${
                    viewer === id ? active : inactive
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold leading-none">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Preset Surfaces ────────────────────────── */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <p className="grafy-section-title">Superficies Predefinidas</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setExpr(p.expr)}
                  className={`grafy-preset-btn p-2.5 rounded-lg text-left border transition-all ${
                    expr === p.expr
                      ? "border-primary/50 bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted hover:border-primary/30"
                  }`}
                >
                  <span className="text-base block mb-0.5">{p.icon}</span>
                  <span className="text-[11px] font-semibold text-foreground/80 leading-tight block">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Function Input ──────────────────────────── */}
          <section className="space-y-2.5">
            <p className="grafy-section-title">Función Personalizada</p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">z = f(x, y, t)</label>
              <input
                type="text"
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                className="grafy-input w-full px-3 py-2 font-mono text-sm"
                placeholder="ej: sin(x+y) - cos(t)"
                spellCheck={false}
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Variables:{" "}
                <code className="px-1 py-0.5 rounded bg-muted font-mono text-primary">x</code>{" "}
                <code className="px-1 py-0.5 rounded bg-muted font-mono text-primary">y</code>{" "}
                <code className="px-1 py-0.5 rounded bg-muted font-mono text-primary">t</code>{" "}
                — sin, cos, sqrt, exp, log, pow, abs, pi…
              </p>
            </div>
          </section>

          {/* ── Surface Parameters ──────────────────────── */}
          <section className="space-y-3">
            <p className="grafy-section-title">Parámetros</p>
            <SliderRow
              label="Rango del dominio" value={range} min={1} max={8} step={0.5}
              badge={`±${range}`} onChange={setRange}
            />
            <SliderRow
              label="Resolución de malla" value={resolution} min={0} max={100} step={1}
              badge={`${meshSegments}×${meshSegments}`} onChange={setResolution}
            />
          </section>

          {/* ── Gradient Controls ───────────────────────── */}
          {viewer === "gradient" && (
            <section className="grafy-card p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-secondary" />
                <p className="text-xs font-bold text-foreground">Campo de Gradiente</p>
              </div>
              <SliderRow
                label="Grilla de vectores" value={vectors} min={6} max={30} step={2}
                badge={`${vectors}×${vectors}`} onChange={setVectors}
              />
              <SliderRow
                label="Escala de flecha" value={vectorScale} min={0.1} max={1.5} step={0.05}
                badge={vectorScale.toFixed(2)} onChange={setVectorScale}
              />
              <SliderRow
                label="Tiempo t" value={tParam} min={-6} max={6} step={0.1}
                badge={tParam.toFixed(1)} onChange={setTParam}
              />
            </section>
          )}

          {/* ── Inspector / Calculator Tools ────────────── */}
          {viewer === "inspector" && (
            <section className="space-y-3">
              <DomainRangeCalculator
                expression={expr} range={range} resolution={meshSegments}
              />
              <LimitsCalculator expression={expr} />
              <PartialDerivativesCalculator expression={expr} />

              <div className="grafy-card p-4 space-y-3">
                <p className="text-xs font-bold text-foreground">Análisis Avanzado</p>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">
                    Densidad σ(x,y)
                  </label>
                  <input
                    type="text" value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="grafy-input w-full px-3 py-1.5 font-mono text-xs"
                    placeholder="1 + 0.2*x*x"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">
                    Restricción g(x,y) = 0
                  </label>
                  <input
                    type="text" value={constraint}
                    onChange={(e) => setConstraint(e.target.value)}
                    className="grafy-input w-full px-3 py-1.5 font-mono text-xs"
                    placeholder="x*x + y*y - 9"
                  />
                </div>
              </div>

              <LagrangeOptimizer expression={expr} constraint={constraint} />
              <IntegrationCalculator expression={expr} density={density || undefined} />
              <RegionVisualization2D
                expression={expr} constraint={constraint}
                xMin={-range} xMax={range} yMin={-range} yMax={range}
              />
            </section>
          )}

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN CANVAS AREA
      ══════════════════════════════════════════════════ */}
      <main className="flex-1 relative bg-background overflow-hidden">

        {/* Viewer label badge */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-card/80 border border-border backdrop-blur-sm flex items-center gap-2">
          {viewerBtns.find((b) => b.id === viewer)?.Icon &&
            (() => {
              const B = viewerBtns.find((b) => b.id === viewer)!
              return <B.Icon className="w-3.5 h-3.5 text-muted-foreground" />
            })()
          }
          <span className="text-xs text-muted-foreground font-medium">
            {viewerBtns.find((b) => b.id === viewer)?.label}
          </span>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-card/70 border border-border backdrop-blur-sm">
          <p className="text-[10px] text-muted-foreground">
            🖱 Rotar · Scroll Zoom · Shift+Drag Pan
          </p>
        </div>

        {viewer === "draggable" && (
          <SurfaceDraggable
            expression={expr} range={range}
            segmentsX={meshSegments} segmentsY={meshSegments}
          />
        )}

        {viewer === "gradient" && (
          <GradientField3D
            expression={compiledFn} range={range}
            segmentsX={meshSegments} segmentsY={meshSegments}
            vectors={vectors} vectorScale={vectorScale}
            step={1e-3} t={tParam}
          />
        )}

        {viewer === "inspector" && (
          <SurfaceInspector
            expression={expr} range={range}
            segmentsX={meshSegments} segmentsY={meshSegments}
          />
        )}

        {viewer === "intersection" && <SurfaceIntersection />}

      </main>
    </div>
  )
}
