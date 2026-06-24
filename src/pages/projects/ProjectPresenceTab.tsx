import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import type { PostTemplate, Project, SocialCampaign, SocialGoal, SocialPlatform, SocialPost, SocialPostStatus } from '../../api/types'
import { CharCounter } from '../../components/CharCounter'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import {
  PLATFORM_CHAR_LIMITS,
  PLATFORM_TITLE_LIMITS,
  applyTemplate,
  copyText,
  projectTemplateVars,
} from '../../lib/presence-utils'
import { SOCIAL_GOALS, SOCIAL_PLATFORMS, SOCIAL_POST_STATUSES, labelFor } from '../../lib/project-dimensions'

type Props = {
  project: Project
}

export function ProjectPresenceTab({ project }: Props) {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([])
  const [templates, setTemplates] = useState<PostTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const [platform, setPlatform] = useState<SocialPlatform>('linkedin')
  const [goal, setGoal] = useState<SocialGoal>('visibility')
  const [status, setStatus] = useState<SocialPostStatus>('draft')
  const [campaignId, setCampaignId] = useState('')
  const [templateSlug, setTemplateSlug] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [hook, setHook] = useState('')
  const [cta, setCta] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    const [p, c, t] = await Promise.all([
      api.presence.posts.list({ projectId: project.id, limit: 50 }),
      api.presence.campaigns.list({ projectId: project.id }),
      api.presence.templates.list({ active: true }),
    ])
    setPosts(p)
    setCampaigns(c)
    setTemplates(t)
  }, [project.id])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load presence', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  const vars = projectTemplateVars(project)
  const fullBody = [hook, body, cta].filter(Boolean).join('\n\n')
  const bodyLimit = PLATFORM_CHAR_LIMITS[platform]
  const titleLimit = PLATFORM_TITLE_LIMITS[platform]

  function applySelectedTemplate(slug: string) {
    setTemplateSlug(slug)
    if (!slug) return
    const tpl = templates.find((t) => t.slug === slug)
    if (!tpl) return
    if (tpl.platform !== 'any' && tpl.platform !== platform) {
      setPlatform(tpl.platform as SocialPlatform)
    }
    setGoal(tpl.goal)
    setBody(applyTemplate(tpl.body, vars))
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.presence.posts.create({
        projectId: project.id,
        campaignId: campaignId || null,
        platform,
        goal,
        status,
        title,
        body,
        hook,
        cta,
        templateSlug: templateSlug || undefined,
        scheduledAt: scheduledAt || null,
      })
      setTitle('')
      setBody('')
      setHook('')
      setCta('')
      setTemplateSlug('')
      setScheduledAt('')
      await reload()
      toast('Post created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function removePost(id: string) {
    if (!(await confirm('Delete this post?'))) return
    try {
      await api.presence.posts.delete(id)
      await reload()
      toast('Post deleted.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function handleCopy(text: string) {
    const ok = await copyText(text)
    toast(ok ? 'Copied to clipboard.' : 'Copy failed.', ok ? 'success' : 'error')
  }

  if (loading) return <p className="muted">Loading presence…</p>

  return (
    <div className="stack-section">
      <form className="card form-grid" onSubmit={onCreate}>
        <h2 className="full">New post for {project.name}</h2>
        <label>
          Platform
          <select value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform)}>
            {SOCIAL_PLATFORMS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Goal
          <select value={goal} onChange={(e) => setGoal(e.target.value as SocialGoal)}>
            {SOCIAL_GOALS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as SocialPostStatus)}>
            {SOCIAL_POST_STATUSES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Campaign
          <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
            <option value="">—</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Template
          <select value={templateSlug} onChange={(e) => applySelectedTemplate(e.target.value)}>
            <option value="">—</option>
            {templates
              .filter((t) => t.platform === 'any' || t.platform === platform)
              .map((t) => (
                <option key={t.id} value={t.slug}>{t.name}</option>
              ))}
          </select>
        </label>
        <label>
          Schedule
          <input value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} placeholder="2026-06-20T09:00:00Z" />
        </label>
        {titleLimit != null && (
          <label className="full">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <CharCounter text={title} limit={titleLimit} />
          </label>
        )}
        {!titleLimit && (
          <label className="full">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
        )}
        <label className="full">
          Hook
          <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="Opening line" />
        </label>
        <label className="full">
          Body
          <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} required />
          <CharCounter text={fullBody} limit={bodyLimit} />
        </label>
        <label className="full">
          CTA
          <input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Link or call to action" />
        </label>
        <div className="form-actions full">
          <button type="button" className="btn ghost" onClick={() => handleCopy(fullBody)} disabled={!fullBody}>
            Copy full text
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Create post'}
          </button>
        </div>
      </form>

      <section className="card">
        <div className="row-actions" style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, flex: 1 }}>Posts ({posts.length})</h2>
          <Link to="/presence" className="btn ghost">Open Presence →</Link>
        </div>
        {posts.length === 0 ? (
          <p className="muted">No posts for this project yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Status</th>
                <th>Title / preview</th>
                <th>Scheduled</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>{labelFor(SOCIAL_PLATFORMS, p.platform)}</td>
                  <td>{labelFor(SOCIAL_POST_STATUSES, p.status)}</td>
                  <td className="muted small">{p.title || p.body.slice(0, 80)}</td>
                  <td className="muted small">{p.scheduledAt?.slice(0, 10) ?? '—'}</td>
                  <td className="row-actions">
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => handleCopy([p.hook, p.body, p.cta].filter(Boolean).join('\n\n'))}
                    >
                      Copy
                    </button>
                    <button type="button" className="btn ghost danger" onClick={() => removePost(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {campaigns.length > 0 && (
        <section className="card">
          <h2>Campaigns ({campaigns.length})</h2>
          <ul className="item-list">
            {campaigns.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong>
                <span className="muted"> · {labelFor(SOCIAL_GOALS, c.goal)}</span>
                {c.startDate && <span className="muted"> · {c.startDate} → {c.endDate ?? '…'}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
