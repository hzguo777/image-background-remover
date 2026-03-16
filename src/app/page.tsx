'use client'

import { useCallback, useState } from 'react'
import Dropzone from '@/components/Dropzone'
import CompareSlider from '@/components/CompareSlider'
import HowItWorks from '@/components/HowItWorks'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function Home() {
  const [state, setState] = useState<State>('idle')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const processFile = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum size is 5MB.')
      setState('error')
      return
    }

    setFileName(file.name)
    setOriginalUrl(URL.createObjectURL(file))
    setResultUrl(null)
    setState('processing')

    const form = new FormData()
    form.append('image', file)

    try {
      const res = await fetch('/api/remove-bg', { method: 'POST', body: form })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Processing failed' }))
        throw new Error(error)
      }
      const blob = await res.blob()
      setResultUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong')
      setState('error')
    }
  }, [])

  const reset = () => {
    setState('idle')
    setOriginalUrl(null)
    setResultUrl(null)
    setErrorMsg('')
    setFileName('')
  }

  const download = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `removed-bg-${fileName.replace(/\.[^.]+$/, '')}.png`
    a.click()
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
          <span className="text-xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
            ✂️ BG Remover
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="py-14 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
          Remove Image Background
        </h1>
        <p className="mt-3 text-lg text-gray-500">100% Automatic &amp; Instant — No signup required</p>
      </section>

      {/* Workspace */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-20">
        {state === 'idle' && <Dropzone onFile={processFile} />}

        {state === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-6 py-24">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-purple-200 border-t-brand" />
            <p className="text-gray-500">Removing background…</p>
          </div>
        )}

        {state === 'done' && originalUrl && resultUrl && (
          <div className="flex flex-col gap-8">
            <CompareSlider originalUrl={originalUrl} resultUrl={resultUrl} />

            {/* Side-by-side thumbnails */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Original</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalUrl} alt="Original" className="w-full rounded-xl border border-gray-200 object-contain max-h-64" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Result</p>
                <div className="checkerboard rounded-xl border border-gray-200 overflow-hidden max-h-64 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resultUrl} alt="Background removed" className="w-full object-contain max-h-64" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={download}
                className="rounded-lg bg-gradient-to-r from-brand to-brand-light px-8 py-3 font-semibold text-white shadow hover:opacity-90 transition-opacity"
              >
                ⬇️ Download PNG
              </button>
              <button
                onClick={reset}
                className="rounded-lg border-2 border-brand px-8 py-3 font-semibold text-brand hover:bg-purple-50 transition-colors"
              >
                Process another image
              </button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <span className="text-5xl">⚠️</span>
            <p className="text-red-500 font-medium">{errorMsg}</p>
            <button
              onClick={reset}
              className="rounded-lg border-2 border-brand px-8 py-3 font-semibold text-brand hover:bg-purple-50 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </main>

      <HowItWorks />

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 BG Remover · Images are processed in memory and never stored · Powered by{' '}
        <a href="https://www.remove.bg" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">
          remove.bg
        </a>
      </footer>
    </div>
  )
}
