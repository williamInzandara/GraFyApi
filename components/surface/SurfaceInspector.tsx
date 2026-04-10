"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import * as THREE from "three"
import SurfaceMesh from "@/components/SurfaceMesh"
import { compileExpression3D } from "@/lib/math-expression"

interface Props {
  expression: string
  range: number
  segmentsX: number
  segmentsY: number
  densityExpression?: string
  constraintExpression?: string
}

function PointMarker({ position }: { position: THREE.Vector3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
    </mesh>
  )
}

export default function SurfaceInspector({
  expression,
  range,
  segmentsX,
  segmentsY,
}: Props) {
  const [inspectPoint, setInspectPoint] = useState<THREE.Vector3 | null>(null)
  const [inspectValue, setInspectValue] = useState<string>("")
  const fn = compileExpression3D(expression)

  function handlePointerMove(e: any) {
    e.stopPropagation()
    if (!e.point) return
    const { x, z } = e.point
    const y_world = z
    const zVal = fn(x, y_world, 0)
    if (Number.isFinite(zVal)) {
      setInspectPoint(new THREE.Vector3(x, zVal, z))
      setInspectValue(
        `x=${x.toFixed(3)}, y=${y_world.toFixed(3)}, z=${zVal.toFixed(4)}`
      )
    }
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        gl={{ antialias: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <mesh onPointerMove={handlePointerMove}>
          <SurfaceMesh
            fn={fn}
            range={range}
            segmentsX={segmentsX}
            segmentsY={segmentsY}
            t={0}
          />
        </mesh>

        {inspectPoint && <PointMarker position={inspectPoint} />}

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

      {inspectValue && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-card/90 border border-border text-xs font-mono text-primary backdrop-blur-sm">
          {inspectValue}
        </div>
      )}
    </div>
  )
}
