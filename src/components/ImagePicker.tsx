import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { MediaAsset } from '../api/types'

type ImagePickerProps = {
  label: string
  value: string | null
  onChange: (id: string | null) => void
}

export function ImagePicker({ label, value, onChange }: ImagePickerProps) {
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

  return (
    <div className="image-picker">
      <span className="field-label">{label}</span>
      <div className="image-picker-row">
        {selected?.mimeType.startsWith('image/') ? (
          <img src={selected.publicUrl} alt="" className="image-picker-thumb" />
        ) : value ? (
          <code className="small">{value}</code>
        ) : (
          <span className="muted small">No image selected</span>
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
            <h2>Select image</h2>
            {loading && <p className="muted">Loading…</p>}
            <div className="media-grid compact">
              {items
                .filter((m) => m.mimeType.startsWith('image/'))
                .map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`media-pick ${value === m.id ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(m.id)
                      setOpen(false)
                    }}
                  >
                    <img src={m.publicUrl} alt={m.filename} />
                    <span className="small">{m.filename}</span>
                  </button>
                ))}
            </div>
            {items.length === 0 && !loading && (
              <p className="muted">No images yet. Upload on the Media page.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
