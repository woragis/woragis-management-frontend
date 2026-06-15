import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import type { MediaAsset } from '../api/types'

export function MediaPage() {
  const [items, setItems] = useState<MediaAsset[]>([])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    try {
      setItems(await api.media.list())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onUpload(file: File) {
    setUploading(true)
    setError('')
    try {
      await api.media.upload(file)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Media</h1>
          <p className="muted">Upload images stored in your Railway bucket (via API).</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void onUpload(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            className="btn primary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="media-grid">
        {items.map((m) => (
          <article key={m.id} className="card media-card">
            {m.mimeType.startsWith('image/') ? (
              <img src={m.publicUrl} alt={m.altText || m.filename} />
            ) : (
              <div className="media-placeholder">{m.mimeType}</div>
            )}
            <div className="media-meta">
              <strong>{m.filename}</strong>
              <code className="small">{m.id}</code>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn small"
                  onClick={() => navigator.clipboard.writeText(m.id)}
                >
                  Copy ID
                </button>
                <button
                  type="button"
                  className="btn small danger"
                  onClick={async () => {
                    if (!confirm('Delete this asset?')) return
                    await api.media.delete(m.id)
                    await load()
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 && <p className="muted">No media uploaded yet.</p>}
      </div>
    </div>
  )
}
