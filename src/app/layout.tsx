import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Extractor de Ofertas — Tesis Felix',
  description: 'Análisis de ofertas de empleo — Competencia en inglés y mercado laboral en Los Mochis, Sinaloa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
