import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { PostTemplate, Project, SocialCampaign, SocialPost, SocialGoal, SocialPlatform, SocialPostStatus } from '../../api/types'
import { CharCounter } from '../../components/CharCounter'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import {
  PLATFORM_CHAR_LIMITS,
  applyTemplate,
  copyText,
  projectTemplateVars,
} from '../../lib/presence-utils'
import { SOCIAL_GOALS, SOCIAL_PLATFORMS, SOCIAL_POST_STATUSES, labelFor } from '../../lib/project-dimensions'

export function PresencePostsPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<SocialPost[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([])
  const [templates, setTemplates] = useState<PostTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  const [createPlatform, setCreatePlatform] = useState<SocialPlatform>('linkedin')
  const [createProjectId, setCreateProjectId] = useState('')
  const [createTemplateSlug, setCreateTemplateSlug] = useState('')
  const [createBody, setCreateBody] = useState('')
  const [createHook, setCreateHook] = useState('')
  const [createCta, setCreateCta] = useState('')

  const reload = useCallback(async () => {
    const [posts, projs, camps, tpls] = await Promise.all([
      api.presence.posts.list({ status: statusFilter || undefined, limit: 100 }),
      api.projects.list(),
      api.presence.campaigns.list(),
      api.presence.templates.list({ active: true }),
    ])
    setRows(posts)
    setProjects(projs)
    setCampaigns(camps)
    setTemplates(tpls)
  }, [statusFilter])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  const selectedProject = projects.find((p) => p.id === createProjectId)
  const createFullBody = [createHook, createBody, createCta].filter(Boolean).join('\n\n')

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

  function applyCreateTemplate(slug: string) {
    setCreateTemplateSlug(slug)
    if (!slug || !selectedProject) return
    const tpl = templates.find((t) => t.slug === slug)
    if (!tpl) return
    const vars = projectTemplateVars(selectedProject)
    setCreateBody(applyTemplate(tpl.body, vars))
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
        body: createBody,
        hook: createHook,
        cta: createCta,
        templateSlug: createTemplateSlug || undefined,
        projectId: String(fd.get('projectId') || '') || null,
        campaignId: String(fd.get('campaignId') || '') || null,
        scheduledAt: String(fd.get('scheduledAt') || '') || null,
      })
      e.currentTarget.reset()
      setCreateBody('')
      setCreateHook('')
      setCreateCta('')
      setCreateTemplateSlug('')
      setCreateProjectId('')
      setCreatePlatform('linkedin')
      await reload()
      toast('Post created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function markPublished(row: SocialPost) {
    const url = row.publishedUrl?.trim() || window.prompt('URL da postagem publicada (obrigatório):', '')?.trim()
    if (!url) {
      toast('Informe a URL da postagem publicada.', 'error')
      return
    }
    const updated: SocialPost = {
      ...row,
      publishedUrl: url,
      status: 'published',
      publishedAt: row.publishedAt ?? new Date().toISOString(),
    }
    updateLocal(row.id, updated)
    await save(updated)
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

  async function handleCopy(text: string) {
    const ok = await copyText(text)
    toast(ok ? 'Copied to clipboard.' : 'Copy failed.', ok ? 'success' : 'error')
  }

  if (loading) return <p className="muted">Loading…</p>

  const bodyLimit = PLATFORM_CHAR_LIMITS[createPlatform]

  return (
    <div className="finance-section">
      <form className="card form-grid" onSubmit={onCreate}>
        <h2 className="full">New post</h2>
        <label>
          Platform
          <select
            name="platform"
            required
            value={createPlatform}
            onChange={(e) => setCreatePlatform(e.target.value as SocialPlatform)}
          >
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
          <select
            name="projectId"
            value={createProjectId}
            onChange={(e) => setCreateProjectId(e.target.value)}
          >
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label>
          Template
          <select
            value={createTemplateSlug}
            onChange={(e) => applyCreateTemplate(e.target.value)}
            disabled={!createProjectId}
          >
            <option value="">—</option>
            {templates
              .filter((t) => t.platform === 'any' || t.platform === createPlatform)
              .map((t) => (
                <option key={t.id} value={t.slug}>{t.name}</option>
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
          Hook
          <input value={createHook} onChange={(e) => setCreateHook(e.target.value)} />
        </label>
        <label className="full">
          Body
          <textarea
            rows={6}
            required
            value={createBody}
            onChange={(e) => setCreateBody(e.target.value)}
          />
          <CharCounter text={createFullBody} limit={bodyLimit} />
        </label>
        <label className="full">
          CTA
          <input value={createCta} onChange={(e) => setCreateCta(e.target.value)} />
        </label>
        <div className="form-actions full">
          <button type="button" className="btn ghost" onClick={() => handleCopy(createFullBody)} disabled={!createFullBody}>
            Copy full text
          </button>
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
            {rows.map((row) => {
              const full = [row.hook, row.body, row.cta].filter(Boolean).join('\n\n')
              const limit = PLATFORM_CHAR_LIMITS[row.platform]
              return (
                <div key={row.id} className="card" style={{ margin: 0 }}>
                  <p className="muted small">
                    {labelFor(SOCIAL_PLATFORMS, row.platform)} · {labelFor(SOCIAL_GOALS, row.goal)} ·{' '}
                    {labelFor(SOCIAL_POST_STATUSES, row.status)}
                    {row.reminderSentAt ? ' · reminder sent' : ''}
                    {row.projectId ? ` · ${projectName(row.projectId)}` : ''}
                    {row.campaignId ? ` · ${campaignName(row.campaignId)}` : ''}
                    {row.status === 'published' && row.publishedUrl ? (
                      <>
                        {' · '}
                        <a href={row.publishedUrl} target="_blank" rel="noreferrer">
                          View post
                        </a>
                      </>
                    ) : null}
                  </p>
                  <label>
                    Title
                    <input value={row.title} onChange={(e) => updateLocal(row.id, { title: e.target.value })} />
                  </label>
                  <label>
                    Hook
                    <input value={row.hook} onChange={(e) => updateLocal(row.id, { hook: e.target.value })} />
                  </label>
                  <label>
                    Body
                    <textarea rows={8} value={row.body} onChange={(e) => updateLocal(row.id, { body: e.target.value })} />
                    <CharCounter text={full} limit={limit} />
                  </label>
                  <label>
                    CTA
                    <input value={row.cta} onChange={(e) => updateLocal(row.id, { cta: e.target.value })} />
                  </label>
                  <label>
                    Published URL
                    <input value={row.publishedUrl} onChange={(e) => updateLocal(row.id, { publishedUrl: e.target.value })} />
                  </label>
                  <div className="form-actions">
                    <button type="button" className="btn ghost" onClick={() => handleCopy(full)}>Copy</button>
                    {row.status !== 'published' && (
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => markPublished(row)}
                      >
                        Mark published
                      </button>
                    )}
                    <button type="button" className="btn primary" disabled={savingId === row.id} onClick={() => save(row)}>
                      {savingId === row.id ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" className="btn ghost danger" onClick={() => remove(row.id)}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
