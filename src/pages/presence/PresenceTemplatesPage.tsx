import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { PostTemplate, SocialGoal, SocialPlatform } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { SOCIAL_GOALS, SOCIAL_PLATFORMS, labelFor } from '../../lib/project-dimensions'

export function PresenceTemplatesPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<PostTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setRows(await api.presence.templates.list())
  }, [])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  function updateLocal(id: string, patch: Partial<PostTemplate>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await api.presence.templates.create({
        slug: String(fd.get('slug')),
        name: String(fd.get('name')),
        platform: (String(fd.get('platform') || 'any')) as SocialPlatform | 'any',
        goal: (String(fd.get('goal') || 'visibility')) as SocialGoal,
        body: String(fd.get('body')),
        active: true,
      })
      e.currentTarget.reset()
      await reload()
      toast('Template created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function save(row: PostTemplate) {
    setSavingId(row.id)
    try {
      const updated = await api.presence.templates.update(row.id, row)
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)))
      toast('Template saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSavingId(null)
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this template?'))) return
    try {
      await api.presence.templates.delete(id)
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
        <h2 className="full">New template</h2>
        <label>
          Slug
          <input name="slug" required placeholder="project_launch" />
        </label>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Platform
          <select name="platform" defaultValue="any">
            <option value="any">Any</option>
            {SOCIAL_PLATFORMS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Goal
          <select name="goal" defaultValue="visibility">
            {SOCIAL_GOALS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="full">
          Body
          <textarea name="body" rows={8} required placeholder="I shipped {{projectName}}…" />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">Add</button>
        </div>
      </form>

      <div className="stack">
        {rows.map((row) => (
          <section key={row.id} className="card">
            <p className="muted small">
              {row.slug} · {row.platform === 'any' ? 'Any platform' : labelFor(SOCIAL_PLATFORMS, row.platform)} ·{' '}
              {labelFor(SOCIAL_GOALS, row.goal)}
            </p>
            <label>
              Name
              <input value={row.name} onChange={(e) => updateLocal(row.id, { name: e.target.value })} />
            </label>
            <label>
              Body
              <textarea rows={10} value={row.body} onChange={(e) => updateLocal(row.id, { body: e.target.value })} />
            </label>
            <div className="form-actions">
              <button type="button" className="btn primary" disabled={savingId === row.id} onClick={() => save(row)}>
                {savingId === row.id ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn ghost danger" onClick={() => remove(row.id)}>Delete</button>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
