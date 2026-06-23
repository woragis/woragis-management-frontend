import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { ChannelDestination, MessageChannel } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function MessagingDestinationsPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<ChannelDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [channelFilter, setChannelFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const data = await api.messaging.destinations.list({
      channel: channelFilter || undefined,
    })
    setRows(data)
  }, [channelFilter])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await api.messaging.destinations.create({
        channel: String(fd.get('channel')),
        externalId: String(fd.get('externalId')),
        name: String(fd.get('name')),
        description: String(fd.get('description') || ''),
        responsibilities: String(fd.get('responsibilities') || ''),
        tags: parseTags(String(fd.get('tags') || '')),
        active: true,
      })
      e.currentTarget.reset()
      await reload()
      toast('Destination created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function toggleActive(row: ChannelDestination) {
    try {
      await api.messaging.destinations.update(row.id, { active: !row.active })
      await reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function saveEdit(row: ChannelDestination) {
    try {
      await api.messaging.destinations.update(row.id, {
        channel: row.channel,
        externalId: row.externalId,
        name: row.name,
        description: row.description,
        responsibilities: row.responsibilities,
        tags: row.tags ?? [],
      })
      setEditingId(null)
      await reload()
      toast('Destination updated.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this destination?'))) return
    try {
      await api.messaging.destinations.delete(id)
      await reload()
      toast('Deleted.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  function patchRow(id: string, patch: Partial<ChannelDestination>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div className="finance-section">
      <form className="card form-grid" onSubmit={onCreate}>
        <h2 className="full">Add destination</h2>
        <label>
          Channel
          <select name="channel" defaultValue="whatsapp" required>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>
        </label>
        <label>
          External ID
          <input
            name="externalId"
            required
            placeholder="120363…@g.us or Telegram chat ID"
          />
        </label>
        <label>
          Name
          <input name="name" required placeholder="LeetCode group" />
        </label>
        <label className="full">
          Description
          <input name="description" />
        </label>
        <label className="full">
          Responsibilities
          <input name="responsibilities" placeholder="Daily problem posts, weekly summary" />
        </label>
        <label className="full">
          Tags (comma-separated)
          <input name="tags" placeholder="leetcode, content" />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">
            Add
          </button>
        </div>
      </form>

      <section className="card">
        <div className="row-actions" style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, flex: 1 }}>Destinations</h2>
          <label className="inline-filter">
            Channel
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
              <option value="">All</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
            </select>
          </label>
        </div>
        {rows.length === 0 ? (
          <p className="muted">No destinations yet. Create one to target groups or chats.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Channel</th>
                <th>External ID</th>
                <th>Tags</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {editingId === r.id ? (
                    <>
                      <td>
                        <input value={r.name} onChange={(e) => patchRow(r.id, { name: e.target.value })} />
                      </td>
                      <td>
                        <select
                          value={r.channel}
                          onChange={(e) => patchRow(r.id, { channel: e.target.value as MessageChannel })}
                        >
                          <option value="whatsapp">whatsapp</option>
                          <option value="telegram">telegram</option>
                        </select>
                      </td>
                      <td>
                        <input
                          value={r.externalId}
                          onChange={(e) => patchRow(r.id, { externalId: e.target.value })}
                        />
                      </td>
                      <td className="muted small">{(r.tags ?? []).join(', ')}</td>
                      <td>{r.active ? 'Active' : 'Inactive'}</td>
                      <td className="row-actions">
                        <button type="button" className="btn primary" onClick={() => saveEdit(r)}>
                          Save
                        </button>
                        <button type="button" className="btn ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <strong>{r.name}</strong>
                        {r.description ? <div className="muted small">{r.description}</div> : null}
                      </td>
                      <td>{r.channel}</td>
                      <td className="muted small mono">{r.externalId}</td>
                      <td className="muted small">{(r.tags ?? []).join(', ') || '—'}</td>
                      <td>{r.active ? 'Active' : 'Inactive'}</td>
                      <td className="row-actions">
                        <button type="button" className="btn ghost" onClick={() => setEditingId(r.id)}>
                          Edit
                        </button>
                        <button type="button" className="btn ghost" onClick={() => toggleActive(r)}>
                          {r.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button type="button" className="btn ghost danger" onClick={() => remove(r.id)}>
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
