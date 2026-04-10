"use client"

import { useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import * as THREE from "three"
import SurfaceMesh from "@/components/SurfaceMesh"
import { type FnXYT, compileExpression2D, gradient } from "@/lib/math-expression"

interface Props {
  expression: FnXYT
  range: number
  segmentsX: number
  segmentsY: number
  vectors: number
  vectorScale: number
  step: number
  t: number
}

function ArrowMesh({
  origin,
  dir,
  scale,
  color,
}: {
  origin: [number, number, number]
  dir: [number, number, number]
  scale: number
  color: string
}) {
  const length = Math.hypot(...dir)
  if (length < 1e-6) return null

  const norm: [number, number, number] = [
    (dir[0] / length) * scale,
    (dir[1] / length) * scale,
    (dir[2] / length) * scale,
  ]

  const points = [
    new THREE.Vector3(...origin),
    new THREE.Vector3(origin[0] + norm[0], origin[1] + norm[1], origin[2] + norm[2]),
  ]
  const geo = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <line geometry={geo}>
      <lineBasicMaterial color={color} linewidth={1} />
    </line>
  )
}

export default function GradientField3D({
  expression,
  range,
  segmentsX,
  segmentsY,
  vectors,
  vectorScale,
  t,
}: Props) {
  const fn2d = useMemo(() => {
    // Build a 2D version from the 3D fn at fixed t
    return (x: number, y: number) => expression(x, y, t)
  }, [expression, t])

  const arrows = useMemo(() => {
    const result: { origin: [number,number,number]; dir: [number,number,number] }[] = []
    const step = (2 * range) / vectors

    for (let i = 0; i < vectors; i++) {
      for (let j = 0; j < vectors; j++) {
        const x = -range + step * (i + 0.5)
        const y = -range + step * (j + 0.5)
        const z = fn2d(x, y)
        if (!Number.isFinite(z)) continue
        const [gx, gy] = gradient(fn2d, x, y)
        if (!Number.isFinite(gx) || !Number.isFinite(gy)) continue
        result.push({
          origin: [x, z, y],
          dir:    [gx, 0, gy],
        })
      }
    }
    return result
  }, [fn2d, range, vectors])

  return (
    <Canvas
      camera={{ position: [8, 6, 8], fov: 50 }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      {/* Surface (semi-transparent) */}
      <SurfaceMesh
        fn={expression}
        range={range}
        segmentsX={segmentsX}
        segmentsY={segmentsY}
        t={t}
        opacity={0.5}
      />

      {/* Gradient arrows */}
      {arrows.map((a, i) => (
        <ArrowMesh
          key={i}
          origin={a.origin}
          dir={a.dir}
          scale={vectorScale}
          color="#f59e0b"
        />
      ))}

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
  )
}
