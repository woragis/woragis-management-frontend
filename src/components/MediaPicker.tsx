import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { MediaAsset } from '../api/types'

export type MediaPickerFilter = 'image' | 'gallery' | 'all'

type MediaPickerProps = {
  label: string
  value: string | null
  onChange: (id: string | null) => void
  filter?: MediaPickerFilter
}

function matchesFilter(mimeType: string, filter: MediaPickerFilter): boolean {
  if (filter === 'image') return mimeType.startsWith('image/')
  if (filter === 'gallery') return mimeType.startsWith('image/') || mimeType.startsWith('video/')
  return true
}

function MediaThumb({ asset }: { asset: MediaAsset }) {
  if (asset.mimeType.startsWith('image/')) {
    return <img src={asset.publicUrl} alt="" className="image-picker-thumb" />
  }
  if (asset.mimeType.startsWith('video/')) {
    return <video src={asset.publicUrl} className="image-picker-thumb" muted playsInline />
  }
  return <span className="muted small">{asset.mimeType}</span>
}

export function MediaPicker({ label, value, onChange, filter = 'image' }: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const selected = items.find((m) => m.id === value)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.media
      .list()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [open])

  const filtered = items.filter((m) => matchesFilter(m.mimeType, filter))

  return (
    <div className="image-picker">
      <span className="field-label">{label}</span>
      <div className="image-picker-row">
        {selected ? (
          <MediaThumb asset={selected} />
        ) : value ? (
          <code className="small">{value}</code>
        ) : (
          <span className="muted small">No media selected</span>
        )}
        <button type="button" className="btn small" onClick={() => setOpen(true)}>
          Choose
        </button>
        {value && (
          <button type="button" className="btn small ghost" onClick={() => onChange(null)}>
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div className="modal card modal-wide" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Select media</h2>
            {loading && <p className="muted">Loading…</p>}
            <div className="media-grid compact">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`media-pick ${value === m.id ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(m.id)
                    setOpen(false)
                  }}
                >
                  {m.mimeType.startsWith('image/') ? (
                    <img src={m.publicUrl} alt={m.filename} />
                  ) : m.mimeType.startsWith('video/') ? (
                    <video src={m.publicUrl} muted playsInline />
                  ) : (
                    <div className="media-placeholder">{m.mimeType}</div>
                  )}
                  <span className="small">{m.filename}</span>
                </button>
              ))}
            </div>
            {filtered.length === 0 && !loading && (
              <p className="muted">No matching media yet. Upload on the Media page.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
