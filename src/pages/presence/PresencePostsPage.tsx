import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Project, SocialCampaign, SocialPost, SocialGoal, SocialPlatform, SocialPostStatus } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { SOCIAL_GOALS, SOCIAL_PLATFORMS, SOCIAL_POST_STATUSES, labelFor } from '../../lib/project-dimensions'

export function PresencePostsPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<SocialPost[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  const reload = useCallback(async () => {
    const [posts, projs, camps] = await Promise.all([
      api.presence.posts.list({ status: statusFilter || undefined, limit: 100 }),
      api.projects.list(),
      api.presence.campaigns.list(),
    ])
    setRows(posts)
    setProjects(projs)
    setCampaigns(camps)
  }, [statusFilter])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  function projectName(id: string | null) {
    if (!id) return '—'
    return projects.find((p) => p.id === id)?.name ?? id.slice(0, 8)
  }

  function campaignName(id: string | null) {
    if (!id) return '—'
    return campaigns.find((c) => c.id === id)?.name ?? id.slice(0, 8)
  }

  function updateLocal(id: string, patch: Partial<SocialPost>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await api.presence.posts.create({
        platform: String(fd.get('platform')) as SocialPlatform,
        goal: (String(fd.get('goal') || 'visibility')) as SocialGoal,
        status: (String(fd.get('status') || 'draft')) as SocialPostStatus,
        title: String(fd.get('title') || ''),
        body: String(fd.get('body')),
        projectId: String(fd.get('projectId') || '') || null,
        campaignId: String(fd.get('campaignId') || '') || null,
        scheduledAt: String(fd.get('scheduledAt') || '') || null,
      })
      e.currentTarget.reset()
      await reload()
      toast('Post created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function save(row: SocialPost) {
    setSavingId(row.id)
    try {
      const updated = await api.presence.posts.update(row.id, row)
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)))
      toast('Post saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSavingId(null)
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this post?'))) return
    try {
      await api.presence.posts.delete(id)
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
        <h2 className="full">New post</h2>
        <label>
          Platform
          <select name="platform" required defaultValue="linkedin">
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
        <label>
          Status
          <select name="status" defaultValue="draft">
            {SOCIAL_POST_STATUSES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Project
          <select name="projectId" defaultValue="">
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label>
          Campaign
          <select name="campaignId" defaultValue="">
            <option value="">—</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Schedule (ISO or date)
          <input name="scheduledAt" placeholder="2026-06-20T09:00:00Z" />
        </label>
        <label className="full">
          Title
          <input name="title" />
        </label>
        <label className="full">
          Body
          <textarea name="body" rows={6} required />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">Add</button>
        </div>
      </form>

      <section className="card">
        <div className="row-actions" style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, flex: 1 }}>Posts</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {SOCIAL_POST_STATUSES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {rows.length === 0 ? (
          <p className="muted">No posts yet.</p>
        ) : (
          <div className="stack">
            {rows.map((row) => (
              <div key={row.id} className="card" style={{ margin: 0 }}>
                <p className="muted small">
                  {labelFor(SOCIAL_PLATFORMS, row.platform)} · {labelFor(SOCIAL_GOALS, row.goal)} ·{' '}
                  {labelFor(SOCIAL_POST_STATUSES, row.status)}
                  {row.projectId ? ` · ${projectName(row.projectId)}` : ''}
                  {row.campaignId ? ` · ${campaignName(row.campaignId)}` : ''}
                </p>
                <label>
                  Title
                  <input value={row.title} onChange={(e) => updateLocal(row.id, { title: e.target.value })} />
                </label>
                <label>
                  Body
                  <textarea rows={8} value={row.body} onChange={(e) => updateLocal(row.id, { body: e.target.value })} />
                </label>
                <label>
                  Published URL
                  <input value={row.publishedUrl} onChange={(e) => updateLocal(row.id, { publishedUrl: e.target.value })} />
                </label>
                <div className="form-actions">
                  <button type="button" className="btn primary" disabled={savingId === row.id} onClick={() => save(row)}>
                    {savingId === row.id ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" className="btn ghost danger" onClick={() => remove(row.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
