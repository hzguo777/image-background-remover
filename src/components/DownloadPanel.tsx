'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  resultUrl: string
  resultBlob: Blob
  fileName: string
  onPreviewChange?: (url: string) => void  // notify parent of composited preview
}

type BgOption = 'transparent' | 'white' | 'custom'

export default function DownloadPanel({ resultUrl, resultBlob, fileName, onPreviewChange }: Props) {
  const [bgOption, setBgOption] = useState<BgOption>('transparent')
  const [customColor, setCustomColor] = useState('#ffffff')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const composite = useCallback(
    (color: string): Promise<{ url: string; blob: Blob }> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current!
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = color
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Canvas export failed')); return }
            resolve({ url: URL.createObjectURL(blob), blob })
          }, 'image/png')
        }
        img.onerror = reject
        img.src = resultUrl
      })
    },
    [resultUrl]
  )

  useEffect(() => {
    let cancelled = false
    let prevUrl = ''

    const update = async () => {
      if (bgOption === 'transparent') {
        onPreviewChange?.(resultUrl)
        return
      }
      const color = bgOption === 'white' ? '#ffffff' : customColor
      const { url } = await composite(color)
      if (!cancelled) {
        if (prevUrl) URL.revokeObjectURL(prevUrl)
        prevUrl = url
        onPreviewChange?.(url)
      }
    }

    update()
    return () => { cancelled = true }
  }, [bgOption, customColor, composite, resultUrl, onPreviewChange])

  const download = async () => {
    let blob: Blob
    let suffix: string

    if (bgOption === 'transparent') {
      blob = resultBlob
      suffix = 'transparent'
    } else {
      const color = bgOption === 'white' ? '#ffffff' : customColor
      const result = await composite(color)
      blob = result.blob
      suffix = bgOption === 'white' ? 'white-bg' : 'custom-bg'
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `removed-bg-${fileName.replace(/\.[^.]+$/, '')}-${suffix}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const options: { value: BgOption; label: string }[] = [
    { value: 'transparent', label: 'Transparent' },
    { value: 'white', label: 'White' },
    { value: 'custom', label: 'Custom' },
  ]

  const previewBg = (opt: BgOption) => {
    if (opt === 'transparent') return 'checkerboard border border-gray-200'
    if (opt === 'white') return 'bg-white border border-gray-300'
    return ''
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Background selector */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Background</p>
        <div className="flex flex-wrap items-center gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBgOption(opt.value)}
              className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all
                ${bgOption === opt.value
                  ? 'border-brand bg-purple-50 text-brand shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {opt.value !== 'custom' && (
                <span className={`inline-block h-4 w-4 rounded-sm ${previewBg(opt.value)}`} />
              )}
              {opt.value === 'custom' && (
                <span className="inline-block h-4 w-4 rounded-sm border border-gray-300"
                  style={{ background: customColor }} />
              )}
              {opt.label}
              {bgOption === opt.value && <span className="text-brand">✓</span>}
            </button>
          ))}

          {bgOption === 'custom' && (
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-gray-200 p-1"
            />
          )}
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={download}
        className="w-full rounded-lg bg-gradient-to-r from-brand to-brand-light py-3 font-semibold text-white shadow hover:opacity-90 transition-opacity"
      >
        ⬇️ Download PNG
      </button>
    </div>
  )
}
