import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "graFyApi — Visualizador Matemático 3D",
  description:
    "Plataforma interactiva de visualización 3D para Cálculo Multivariable: superficies, gradientes, derivadas parciales e integración.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
