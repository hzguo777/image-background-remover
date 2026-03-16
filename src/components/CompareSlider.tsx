'use client'

import { useRef, useState } from 'react'

interface Props {
  originalUrl: string
  resultUrl: string
}

export default function CompareSlider({ originalUrl, resultUrl }: Props) {
  const [pos, setPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePos = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setPos(pct)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return
    updatePos(e.clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    updatePos(e.touches[0].clientX)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-gray-200 select-none cursor-col-resize"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* Result (right side — checkerboard) */}
      <div className="checkerboard absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resultUrl} alt="Background removed" className="w-full h-full object-contain" />
      </div>

      {/* Original (left side, clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={originalUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain" style={{ width: containerRef.current?.offsetWidth ?? '100%' }} />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 text-xs font-bold">
          ⇔
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-2 left-3 rounded bg-black/40 px-2 py-0.5 text-xs text-white">Original</span>
      <span className="absolute top-2 right-3 rounded bg-black/40 px-2 py-0.5 text-xs text-white">Removed</span>
    </div>
  )
}
