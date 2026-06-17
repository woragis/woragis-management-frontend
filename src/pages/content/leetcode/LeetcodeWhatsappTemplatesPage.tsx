import { useCallback, useEffect, useState } from 'react'
import { api } from '../../../api/client'
import type { WhatsappMessageTemplate } from '../../../api/types'
import { useToast } from '../../../context/ToastContext'

export function LeetcodeWhatsappTemplatesPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<WhatsappMessageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const data = await api.content.leetcode.whatsappTemplates.list()
    setRows(data)
  }, [])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  function updateLocal(id: string, patch: Partial<WhatsappMessageTemplate>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  async function save(row: WhatsappMessageTemplate) {
    setSavingId(row.id)
    try {
      const updated = await api.content.leetcode.whatsappTemplates.update(row.id, {
        name: row.name,
        body: row.body,
      })
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)))
      toast('Template saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div className="stack">
      {rows.map((row) => (
        <section key={row.id} className="card">
          <h2>{row.name}</h2>
          <p className="muted small">{row.slug}</p>
          <label>
            Name
            <input value={row.name} onChange={(e) => updateLocal(row.id, { name: e.target.value })} />
          </label>
          <label>
            Body
            <textarea
              rows={12}
              value={row.body}
              onChange={(e) => updateLocal(row.id, { body: e.target.value })}
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn primary"
              disabled={savingId === row.id}
              onClick={() => save(row)}
            >
              {savingId === row.id ? 'Saving…' : 'Save'}
            </button>
          </div>
        </section>
      ))}
    </div>
  )
}
