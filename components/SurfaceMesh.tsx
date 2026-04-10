"use client"

import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { type FnXYT } from "@/lib/math-expression"

interface Props {
  fn: FnXYT
  range: number
  segmentsX: number
  segmentsY: number
  t?: number
  wireframe?: boolean
  opacity?: number
  colorTop?: string
  colorBottom?: string
}

export default function SurfaceMesh({
  fn,
  range,
  segmentsX,
  segmentsY,
  t = 0,
  wireframe = false,
  opacity = 1,
  colorTop = "#22c55e",
  colorBottom = "#7c3aed",
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const nx = segmentsX
    const ny = segmentsY
    const positions: number[] = []
    const colors: number[]    = []
    const indices: number[]   = []

    const colTop = new THREE.Color(colorTop)
    const colBot = new THREE.Color(colorBottom)

    // Sample grid
    const grid: number[][] = []
    let zMin = Infinity
    let zMax = -Infinity

    for (let i = 0; i <= nx; i++) {
      grid[i] = []
      for (let j = 0; j <= ny; j++) {
        const x = -range + (2 * range * i) / nx
        const y = -range + (2 * range * j) / ny
        const z = fn(x, y, t)
        grid[i][j] = Number.isFinite(z) ? z : 0
        if (grid[i][j] < zMin) zMin = grid[i][j]
        if (grid[i][j] > zMax) zMax = grid[i][j]
      }
    }

    const zRange = zMax - zMin || 1

    for (let i = 0; i <= nx; i++) {
      for (let j = 0; j <= ny; j++) {
        const x = -range + (2 * range * i) / nx
        const y = -range + (2 * range * j) / ny
        const z = grid[i][j]
        positions.push(x, z, y) // three.js: Y is up

        const t01 = (z - zMin) / zRange
        const c   = colBot.clone().lerp(colTop, t01)
        colors.push(c.r, c.g, c.b)
      }
    }

    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const a = i * (ny + 1) + j
        const b = a + 1
        const c = (i + 1) * (ny + 1) + j
        const d = c + 1
        indices.push(a, b, d, a, d, c)
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute("color",    new THREE.Float32BufferAttribute(colors, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [fn, range, segmentsX, segmentsY, t, colorTop, colorBottom])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhongMaterial
        vertexColors
        side={THREE.DoubleSide}
        wireframe={wireframe}
        transparent={opacity < 1}
        opacity={opacity}
        shininess={60}
      />
    </mesh>
  )
}
