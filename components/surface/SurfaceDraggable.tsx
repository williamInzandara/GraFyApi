"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Grid, Environment } from "@react-three/drei"
import SurfaceMesh from "@/components/SurfaceMesh"
import { compileExpression3D, type FnXYT } from "@/lib/math-expression"

interface Props {
  expression: string
  range: number
  segmentsX: number
  segmentsY: number
}

function AnimatedSurface({
  fn,
  range,
  segmentsX,
  segmentsY,
}: {
  fn: FnXYT
  range: number
  segmentsX: number
  segmentsY: number
}) {
  const [time, setTime] = useState(0)
  useFrame((_, delta) => setTime((t) => t + delta * 0.6))

  return (
    <SurfaceMesh
      fn={fn}
      range={range}
      segmentsX={segmentsX}
      segmentsY={segmentsY}
      t={time}
    />
  )
}

export default function SurfaceDraggable({ expression, range, segmentsX, segmentsY }: Props) {
  const fn = compileExpression3D(expression)

  return (
    <Canvas
      camera={{ position: [8, 6, 8], fov: 50 }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -5, -5]} intensity={0.3} />

      <AnimatedSurface fn={fn} range={range} segmentsX={segmentsX} segmentsY={segmentsY} />

      <Grid
        args={[range * 2, range * 2]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#334155"
        sectionSize={range}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={range * 6}
        fadeStrength={1}
        position={[0, -range * 0.8, 0]}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={range * 6}
      />
    </Canvas>
  )
}
