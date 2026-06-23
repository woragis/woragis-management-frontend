import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { ChannelDestination, MessageTemplate } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'

export function MessagingTemplatesPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<MessageTemplate[]>([])
  const [destinations, setDestinations] = useState<ChannelDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const [templates, dests] = await Promise.all([
      api.messaging.templates.list(),
      api.messaging.destinations.list(),
    ])
    setRows(templates)
    setDestinations(dests)
  }, [])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  function destinationName(id: string | null) {
    if (!id) return '—'
    return destinations.find((d) => d.id === id)?.name ?? id.slice(0, 8)
  }

  function updateLocal(id: string, patch: Partial<MessageTemplate>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const destRaw = String(fd.get('destinationId') || '')
    try {
      await api.messaging.templates.create({
        destinationId: destRaw || null,
        programSlug: String(fd.get('programSlug') || 'custom'),
        slug: String(fd.get('slug')),
        name: String(fd.get('name')),
        body: String(fd.get('body')),
        composeMode: String(fd.get('composeMode') || 'static'),
        aiPromptHint: String(fd.get('aiPromptHint') || ''),
        active: true,
      })
      e.currentTarget.reset()
      await reload()
      toast('Template created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function save(row: MessageTemplate) {
    setSavingId(row.id)
    try {
      const updated = await api.messaging.templates.update(row.id, {
        destinationId: row.destinationId,
        programSlug: row.programSlug,
        slug: row.slug,
        name: row.name,
        body: row.body,
        composeMode: row.composeMode,
        aiPromptHint: row.aiPromptHint,
        active: row.active,
      })
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)))
      toast('Template saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSavingId(null)
    }
  }

  async function toggleActive(row: MessageTemplate) {
    updateLocal(row.id, { active: !row.active })
    try {
      await api.messaging.templates.update(row.id, { active: !row.active })
      await reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
      await reload()
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this template?'))) return
    try {
      await api.messaging.templates.delete(id)
      await reload()
      toast('Deleted.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div className="finance-section">
      <form className="card form-grid" onSubmit={onCreate}>
        <h2 className="full">Add template</h2>
        <label>
          Slug
          <input name="slug" required placeholder="daily_reminder" />
        </label>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Program
          <input name="programSlug" defaultValue="custom" placeholder="custom, leetcode" />
        </label>
        <label>
          Destination (optional)
          <select name="destinationId" defaultValue="">
            <option value="">Any / global</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.channel})
              </option>
            ))}
          </select>
        </label>
        <label>
          Compose mode
          <select name="composeMode" defaultValue="static">
            <option value="static">Static</option>
            <option value="ai_assisted">AI assisted</option>
          </select>
        </label>
        <label className="full">
          AI prompt hint
          <input name="aiPromptHint" placeholder="Tone and constraints for compose" />
        </label>
        <label className="full">
          Body
          <textarea name="body" rows={6} required placeholder="Hello {{name}}!" />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">
            Add
          </button>
        </div>
      </form>

      <div className="stack">
        {rows.length === 0 ? (
          <section className="card">
            <p className="muted">No templates yet.</p>
          </section>
        ) : (
          rows.map((row) => (
            <section key={row.id} className="card">
              <div className="row-actions" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{row.name}</h2>
                  <p className="muted small">
                    {row.slug} · {row.programSlug} · {row.composeMode}
                    {row.destinationId ? ` · ${destinationName(row.destinationId)}` : ''}
                  </p>
                </div>
                <div className="row-actions">
                  <button type="button" className="btn ghost" onClick={() => toggleActive(row)}>
                    {row.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="btn ghost danger" onClick={() => remove(row.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <label>
                Name
                <input value={row.name} onChange={(e) => updateLocal(row.id, { name: e.target.value })} />
              </label>
              <label>
                Slug
                <input value={row.slug} onChange={(e) => updateLocal(row.id, { slug: e.target.value })} />
              </label>
              <label>
                Destination
                <select
                  value={row.destinationId ?? ''}
                  onChange={(e) =>
                    updateLocal(row.id, { destinationId: e.target.value || null })
                  }
                >
                  <option value="">Any / global</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.channel})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Compose mode
                <select
                  value={row.composeMode}
                  onChange={(e) =>
                    updateLocal(row.id, {
                      composeMode: e.target.value as MessageTemplate['composeMode'],
                    })
                  }
                >
                  <option value="static">Static</option>
                  <option value="ai_assisted">AI assisted</option>
                </select>
              </label>
              <label>
                Body
                <textarea
                  rows={10}
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
          ))
        )}
      </div>
    </div>
  )
}
