'use client'

import { useCallback, useRef, useState } from 'react'

interface Props {
  onFile: (file: File) => void
}

export default function Dropzone({ onFile }: Props) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
      onFile(file)
    },
    [onFile]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <label
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-20 cursor-pointer transition-colors
        ${dragging ? 'border-brand bg-purple-50' : 'border-purple-300 bg-purple-50/50 hover:border-brand hover:bg-purple-50'}`}
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <span className="text-5xl">🖼️</span>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">Drop image here or click to upload</p>
        <p className="mt-1 text-sm text-gray-400">JPG, PNG, WebP · Max 5MB</p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 rounded-lg bg-gradient-to-r from-brand to-brand-light px-6 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity"
      >
        Select Image
      </button>
    </label>
  )
}
