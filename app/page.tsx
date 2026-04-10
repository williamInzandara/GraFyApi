"use client"

import dynamic from "next/dynamic"

// Load entire app client-side — Three.js/WebGL requires the browser
const App = dynamic(() => import("@/components/App"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(220,20%,7%)",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "2px solid hsl(142,72%,52%)",
          borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
        }}
      />
      <p style={{ color: "hsl(220,10%,55%)", fontSize: 14, fontFamily: "sans-serif" }}>
        Cargando graFyApi…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
})

export default function Page() {
  return <App />
}
