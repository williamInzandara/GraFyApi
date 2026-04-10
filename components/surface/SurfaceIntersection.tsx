"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import SurfaceMesh from "@/components/SurfaceMesh"
import { compileExpression3D } from "@/lib/math-expression"

const DEFAULT_F = "sin(sqrt(x*x + y*y))/sqrt(x*x + y*y + 0.1)"
const DEFAULT_G = "0.3 * cos(x) * sin(y)"

export default function SurfaceIntersection() {
  const [exprF, setExprF] = useState(DEFAULT_F)
  const [exprG, setExprG] = useState(DEFAULT_G)
  const [range, setRange]   = useState(4)

  const fnF = compileExpression3D(exprF)
  const fnG = compileExpression3D(exprG)

  return (
    <div className="w-full h-full relative">
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="grafy-card p-3 space-y-2 w-72">
          <p className="text-xs font-bold text-foreground">Superficie F (verde)</p>
          <input
            value={exprF}
            onChange={(e) => setExprF(e.target.value)}
            className="grafy-input w-full px-2 py-1.5 text-xs font-mono"
            placeholder="f(x, y)"
          />
        </div>
        <div className="grafy-card p-3 space-y-2 w-72">
          <p className="text-xs font-bold text-foreground">Superficie G (violeta)</p>
          <input
            value={exprG}
            onChange={(e) => setExprG(e.target.value)}
            className="grafy-input w-full px-2 py-1.5 text-xs font-mono"
            placeholder="g(x, y)"
          />
        </div>
      </div>

      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        gl={{ antialias: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Surface F */}
        <SurfaceMesh
          fn={fnF}
          range={range}
          segmentsX={60}
          segmentsY={60}
          opacity={0.75}
          colorTop="#22c55e"
          colorBottom="#16a34a"
        />

        {/* Surface G */}
        <SurfaceMesh
          fn={fnG}
          range={range}
          segmentsX={60}
          segmentsY={60}
          opacity={0.75}
          colorTop="#a855f7"
          colorBottom="#7c3aed"
        />

        <Grid
          args={[range * 2, range * 2]}
          cellSize={1}
          cellColor="#1e293b"
          sectionSize={range}
          sectionColor="#334155"
          fadeDistance={range * 5}
          position={[0, -range * 0.8, 0]}
        />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}
