'use client'

import { useState, useCallback } from 'react'
import styles from './page.module.css'

type State = 'idle' | 'uploading' | 'done' | 'error'

export default function Home() {
  const [state, setState] = useState<State>('idle')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')

  const processFile = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload JPG, PNG, or WebP.')
      setState('error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum size is 5MB.')
      setState('error')
      return
    }

    setFileName(file.name)
    setOriginalUrl(URL.createObjectURL(file))
    setState('uploading')

    const form = new FormData()
    form.append('image', file)

    try {
      const res = await fetch('/api/remove-bg', { method: 'POST', body: form })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Processing failed')
      }
      const blob = await res.blob()
      setResultUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong')
      setState('error')
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

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
    <main className={styles.main}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.logo}>✂️ BG Remover</h1>
        </div>
      </header>

      <section className={styles.hero}>
        <div className="container">
          <h2 className={styles.title}>Remove Image Background</h2>
          <p className={styles.subtitle}>100% Automatic &amp; Instant — No signup required</p>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className="container">
          {state === 'idle' && (
            <label
              className={styles.dropzone}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} hidden />
              <span className={styles.dropIcon}>🖼️</span>
              <span className={styles.dropText}>Drop image here or click to upload</span>
              <span className={styles.dropHint}>JPG, PNG, WebP · Max 5MB</span>
            </label>
          )}

          {state === 'uploading' && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Removing background…</p>
            </div>
          )}

          {state === 'done' && originalUrl && resultUrl && (
            <div className={styles.result}>
              <div className={styles.images}>
                <div className={styles.imgBox}>
                  <p className={styles.imgLabel}>Original</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt="Original" />
                </div>
                <div className={styles.imgBox}>
                  <p className={styles.imgLabel}>Result</p>
                  <div className={styles.checkerboard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultUrl} alt="Background removed" />
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.btnPrimary} onClick={download}>⬇️ Download PNG</button>
                <button className={styles.btnSecondary} onClick={reset}>Process another image</button>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className={styles.error}>
              <p>⚠️ {errorMsg}</p>
              <button className={styles.btnSecondary} onClick={reset}>Try again</button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.howto}>
        <div className="container">
          <h3>How it works</h3>
          <div className={styles.steps}>
            <div className={styles.step}><span>1</span><p>Upload your image</p></div>
            <div className={styles.step}><span>2</span><p>AI removes the background</p></div>
            <div className={styles.step}><span>3</span><p>Download transparent PNG</p></div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <p>© 2026 BG Remover · Powered by remove.bg</p>
        </div>
      </footer>
    </main>
  )
}
