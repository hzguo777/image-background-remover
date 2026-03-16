import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Remove Image Background Free Online | BG Remover',
  description:
    'Remove background from images instantly with AI. Free online tool, no signup required. Supports JPG, PNG, WebP.',
  keywords: 'image background remover, remove bg, background eraser, transparent background',
  openGraph: {
    title: 'Remove Image Background Free Online',
    description: 'AI-powered background removal. Free, instant, no signup.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
