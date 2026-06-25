import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImagePicker } from '../components/ImagePicker'
import { MediaPicker } from '../components/MediaPicker'
import { MarkdownField } from '../components/MarkdownPreview'
import { api } from '../api/client'
import type { Project, ProjectDomain, ProjectEnv, ProjectLink, ProjectSecret, ProjectDistribution, ProjectAccessLevel } from '../api/types'
import {
  PROJECT_ACCESS_LEVELS,
  PROJECT_DISTRIBUTIONS,
  PROJECT_INTENTS,
  PROJECT_MATURITY,
  PROJECT_MONETIZATION,
  PROJECT_VISIBILITY_GOALS,
} from '../lib/project-dimensions'
import { ProjectPresenceTab } from './projects/ProjectPresenceTab'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'

type Tab = 'general' | 'links' | 'domains' | 'secrets' | 'env' | 'gallery' | 'presence'

export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [project, setProject] = useState<Project | null>(null)
  const [tab, setTab] = useState<Tab>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverImageId, setCoverImageId] = useState<string | null>(null)
  const [longDescription, setLongDescription] = useState('')
  const [distribution, setDistribution] = useState<ProjectDistribution[]>([])
  const [accessLevel, setAccessLevel] = useState<ProjectAccessLevel>('private')

  const reload = useCallback(async () => {
    const p = await api.projects.get(id)
    setProject(p)
    setCoverImageId(p.coverImageId)
    setLongDescription(p.longDescription)
    setDistribution(p.distribution ?? [])
    setAccessLevel(p.accessLevel ?? (p.isPublic ? 'public' : 'private'))
  }, [id])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  async function saveGeneral(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!project) return
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const nextAccess = String(fd.get('accessLevel')) as ProjectAccessLevel
    const payload: Parameters<typeof api.projects.update>[1] = {
      name: String(fd.get('name')),
      slug: String(fd.get('slug')),
      status: String(fd.get('status')) as Project['status'],
      shortDescription: String(fd.get('shortDescription')),
      longDescription,
      description: String(fd.get('description')),
      notes: String(fd.get('notes')),
      repoUrl: String(fd.get('repoUrl')),
      demoUrl: String(fd.get('demoUrl')),
      githubUrl: String(fd.get('githubUrl')),
      repoVisibility: String(fd.get('repoVisibility')) as Project['repoVisibility'],
      publicSlug: String(fd.get('publicSlug')),
      displayOrder: Number(fd.get('displayOrder') || 0),
      stack: String(fd.get('stack'))
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      intent: String(fd.get('intent')) as Project['intent'],
      monetization: String(fd.get('monetization')) as Project['monetization'],
      maturity: String(fd.get('maturity')) as Project['maturity'],
      visibilityGoal: String(fd.get('visibilityGoal')) as Project['visibilityGoal'],
      distribution,
      accessLevel: nextAccess,
      featured: nextAccess === 'secret' ? false : fd.get('featured') === 'on',
      coverImageId,
    }
    try {
      if (project.accessLevel === 'secret' && nextAccess !== 'secret') {
        const pwd = window.prompt(
          'Este projeto é SECRETO. Digite a senha de desbloqueio para alterar a visibilidade:',
        )
        if (!pwd) {
          toast('Senha obrigatória para sair do modo secreto.', 'error')
          return
        }
        payload.secretUnlockPassword = pwd
      }
      const updated = await api.projects.update(id, payload)
      setProject(updated)
      setAccessLevel(updated.accessLevel)
      toast('Project saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProject() {
    if (!(await confirm('Delete this project and all related data?'))) return
    try {
      await api.projects.delete(id)
      toast('Project deleted.', 'success')
      navigate('/projects')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>
  if (!project) return null

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/projects" className="back-link">← Projects</Link>
          <h1>{project.name}</h1>
          <p className="muted">
            {project.slug}
            {project.accessLevel === 'secret' ? (
              <span className="badge danger" style={{ marginLeft: '0.5rem' }}>
                SECRET
              </span>
            ) : null}
          </p>
        </div>
        <button type="button" className="btn danger" onClick={deleteProject}>
          Delete
        </button>
      </header>

      <div className="tabs">
        {(['general', 'links', 'domains', 'secrets', 'env', 'gallery', 'presence'] as Tab[]).map((t) => (
          <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <form className="card form-grid" onSubmit={saveGeneral}>
          <label>
            Name
            <input name="name" defaultValue={project.name} required key={project.updatedAt} />
          </label>
          <label>
            Slug
            <input name="slug" defaultValue={project.slug} key={`slug-${project.updatedAt}`} />
          </label>
          <label>
            Status
            <select name="status" defaultValue={project.status}>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <h2 className="full">Strategy</h2>
          <label>
            Intent
            <select name="intent" defaultValue={project.intent || 'portfolio'} key={`intent-${project.updatedAt}`}>
              {PROJECT_INTENTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label>
            Monetization
            <select name="monetization" defaultValue={project.monetization || 'none'} key={`mon-${project.updatedAt}`}>
              {PROJECT_MONETIZATION.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label>
            Maturity
            <select name="maturity" defaultValue={project.maturity || 'idea'} key={`mat-${project.updatedAt}`}>
              {PROJECT_MATURITY.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label>
            Visibility goal
            <select name="visibilityGoal" defaultValue={project.visibilityGoal || 'private'} key={`vis-${project.updatedAt}`}>
              {PROJECT_VISIBILITY_GOALS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <fieldset className="full checkbox-group">
            <legend>Distribution channels</legend>
            {PROJECT_DISTRIBUTIONS.map((o) => (
              <label key={o.value} className="checkbox inline">
                <input
                  type="checkbox"
                  checked={distribution.includes(o.value)}
                  onChange={(e) => {
                    setDistribution((prev) =>
                      e.target.checked ? [...prev, o.value] : prev.filter((d) => d !== o.value),
                    )
                  }}
                />
                {o.label}
              </label>
            ))}
          </fieldset>
          <label>
            Display order
            <input name="displayOrder" type="number" defaultValue={project.displayOrder} />
          </label>
          <label>
            Public slug
            <input name="publicSlug" defaultValue={project.publicSlug} placeholder="lokra-crm" />
          </label>
          <div className="full">
            <ImagePicker label="Cover image" value={coverImageId} onChange={setCoverImageId} />
          </div>
          <label className="full">
            Short description
            <input name="shortDescription" defaultValue={project.shortDescription} />
          </label>
          <MarkdownField label="Long description (markdown)" value={longDescription} onChange={setLongDescription} rows={6} />
          <label className="full">
            Internal description
            <textarea name="description" rows={3} defaultValue={project.description} />
          </label>
          <label className="full">
            Notes
            <textarea name="notes" rows={2} defaultValue={project.notes} />
          </label>
          <label className="full">
            Stack
            <input name="stack" defaultValue={(project.stack ?? []).join(', ')} />
          </label>
          <label>
            Repo URL
            <input name="repoUrl" defaultValue={project.repoUrl} />
          </label>
          <label>
            Demo URL
            <input name="demoUrl" defaultValue={project.demoUrl} />
          </label>
          <label>
            GitHub URL
            <input name="githubUrl" defaultValue={project.githubUrl} placeholder="https://github.com/user/repo" />
          </label>
          <label>
            Repository visibility
            <select name="repoVisibility" defaultValue={project.repoVisibility || 'private'}>
              <option value="private">Private (hidden on landing)</option>
              <option value="public">Public (show on landing)</option>
            </select>
          </label>
          <label>
            Access level
            <select
              name="accessLevel"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as ProjectAccessLevel)}
            >
              {PROJECT_ACCESS_LEVELS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {accessLevel === 'secret' ? (
            <p className="muted small full">
              Projetos secretos nunca aparecem na landing. Para mudar para privado ou público, será
              pedida a senha de desbloqueio.
            </p>
          ) : null}
          <label className="checkbox" style={{ opacity: accessLevel === 'secret' ? 0.5 : 1 }}>
            <input
              name="featured"
              type="checkbox"
              defaultChecked={project.featured}
              disabled={accessLevel === 'secret'}
            />
            Featured
          </label>
          <div className="form-actions full">
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      {tab === 'links' && <LinksTab projectId={id} links={project.links ?? []} onChange={reload} />}
      {tab === 'domains' && <DomainsTab projectId={id} domains={project.domains ?? []} onChange={reload} />}
      {tab === 'secrets' && <SecretsTab projectId={id} />}
      {tab === 'env' && <EnvsTab projectId={id} envs={project.envs ?? []} onChange={reload} />}
      {tab === 'gallery' && <GalleryTab projectId={id} items={project.gallery ?? []} onChange={reload} />}
      {tab === 'presence' && <ProjectPresenceTab project={project} />}
    </div>
  )
}

function LinksTab({ projectId, links, onChange }: { projectId: string; links: ProjectLink[]; onChange: () => Promise<void> }) {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [type, setType] = useState('frontend')
  const [url, setUrl] = useState('')
  const [environment, setEnvironment] = useState('production')
  const [label, setLabel] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  async function add(e: FormEvent) {
    e.preventDefault()
    try {
      await api.projects.addLink(projectId, { type, url, environment, label, isPublic })
      setUrl('')
      await onChange()
      toast('Link added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  return (
    <div className="stack-section">
      <form className="card form-grid inline-add" onSubmit={add}>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="frontend">frontend</option>
            <option value="backend">backend</option>
            <option value="docs">docs</option>
            <option value="staging">staging</option>
            <option value="admin">admin</option>
            <option value="api">api</option>
            <option value="play_store">play_store</option>
            <option value="app_store">app_store</option>
            <option value="other">other</option>
          </select>
        </label>
        <label className="span-2">
          URL
          <input required value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <label>
          Env
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
            <option value="production">production</option>
            <option value="staging">staging</option>
            <option value="local">local</option>
          </select>
        </label>
        <label>
          Label
          <input value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Public
        </label>
        <button type="submit" className="btn primary">Add link</button>
      </form>
      <ul className="item-list card">
        {links.map((l) => (
          <li key={l.id}>
            <div>
              <strong>{l.type}</strong> · {l.environment}
              {l.label && <span className="muted"> — {l.label}</span>}
              <div><a href={l.url} target="_blank" rel="noreferrer">{l.url}</a></div>
            </div>
            <button
              type="button"
              className="btn small danger"
              onClick={async () => {
                if (!(await confirm('Remove this link?'))) return
                await api.projects.deleteLink(projectId, l.id)
                await onChange()
                toast('Link removed.', 'success')
              }}
            >
              Remove
            </button>
          </li>
        ))}
        {links.length === 0 && <li className="muted">No links yet.</li>}
      </ul>
    </div>
  )
}

function DomainsTab({ projectId, domains, onChange }: { projectId: string; domains: ProjectDomain[]; onChange: () => Promise<void> }) {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [domain, setDomain] = useState('')
  const [registrar, setRegistrar] = useState('')
  const [purpose, setPurpose] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    try {
      await api.projects.addDomain(projectId, { domain, registrar, purpose })
      setDomain('')
      await onChange()
      toast('Domain added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  return (
    <div className="stack-section">
      <form className="card form-grid inline-add" onSubmit={add}>
        <label>
          Domain
          <input required value={domain} onChange={(e) => setDomain(e.target.value)} />
        </label>
        <label>
          Registrar
          <input value={registrar} onChange={(e) => setRegistrar(e.target.value)} />
        </label>
        <label>
          Purpose
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </label>
        <button type="submit" className="btn primary">Add domain</button>
      </form>
      <ul className="item-list card">
        {domains.map((d) => (
          <li key={d.id}>
            <div>
              <strong>{d.domain}</strong>
              {d.registrar && <span className="muted"> · {d.registrar}</span>}
              {d.expiresAt && <span className="muted small"> · expires {new Date(d.expiresAt).toLocaleDateString()}</span>}
            </div>
            <button
              type="button"
              className="btn small danger"
              onClick={async () => {
                if (!(await confirm('Remove this domain?'))) return
                await api.projects.deleteDomain(projectId, d.id)
                await onChange()
                toast('Domain removed.', 'success')
              }}
            >
              Remove
            </button>
          </li>
        ))}
        {domains.length === 0 && <li className="muted">No domains yet.</li>}
      </ul>
    </div>
  )
}

function SecretsTab({ projectId }: { projectId: string }) {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [secrets, setSecrets] = useState<ProjectSecret[]>([])
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [service, setService] = useState('')
  const [revealed, setRevealed] = useState<Record<string, string>>({})

  useEffect(() => {
    api.projects.listSecrets(projectId).then(setSecrets)
  }, [projectId])

  async function add(e: FormEvent) {
    e.preventDefault()
    try {
      await api.projects.addSecret(projectId, { name, value, service })
      setName('')
      setValue('')
      setSecrets(await api.projects.listSecrets(projectId))
      toast('Secret added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  return (
    <div className="stack-section">
      <form className="card form-grid inline-add" onSubmit={add}>
        <label>
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="span-2">
          Value
          <input required type="password" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label>
          Service
          <input value={service} onChange={(e) => setService(e.target.value)} />
        </label>
        <button type="submit" className="btn primary">Add secret</button>
      </form>
      <ul className="item-list card">
        {secrets.map((s) => (
          <li key={s.id}>
            <div>
              <strong>{s.name}</strong>
              {s.service && <span className="muted"> · {s.service}</span>}
              {revealed[s.id] && <code className="secret-value">{revealed[s.id]}</code>}
            </div>
            <div className="row-actions">
              <button
                type="button"
                className="btn small"
                onClick={async () => {
                  const item = await api.projects.getSecret(projectId, s.id)
                  setRevealed((prev) => ({ ...prev, [s.id]: item.value ?? '' }))
                }}
              >
                Reveal
              </button>
              <button
                type="button"
                className="btn small danger"
                onClick={async () => {
                  if (!(await confirm('Delete this secret?'))) return
                  await api.projects.deleteSecret(projectId, s.id)
                  setSecrets(await api.projects.listSecrets(projectId))
                  toast('Secret removed.', 'success')
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {secrets.length === 0 && <li className="muted">No secrets yet.</li>}
      </ul>
    </div>
  )
}

function EnvsTab({
  projectId,
  envs,
  onChange,
}: {
  projectId: string
  envs: ProjectEnv[]
  onChange: () => Promise<void>
}) {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [environment, setEnvironment] = useState('production')

  async function add(e: FormEvent) {
    e.preventDefault()
    try {
      await api.projects.addEnv(projectId, { key, value, environment })
      setKey('')
      setValue('')
      await onChange()
      toast('Env var added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  return (
    <div className="stack-section">
      <form className="card form-grid inline-add" onSubmit={add}>
        <label>
          Key
          <input required value={key} onChange={(e) => setKey(e.target.value)} placeholder="NEXT_PUBLIC_API_URL" />
        </label>
        <label className="span-2">
          Value
          <input required value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label>
          Environment
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
            <option value="production">production</option>
            <option value="staging">staging</option>
            <option value="local">local</option>
          </select>
        </label>
        <button type="submit" className="btn primary">Add env</button>
      </form>
      <ul className="item-list card">
        {envs.map((env) => (
          <li key={env.id}>
            <div>
              <code>{env.key}</code>
              <span className="muted"> · {env.environment}</span>
              <div className="small">{env.value}</div>
            </div>
            <button
              type="button"
              className="btn small danger"
              onClick={async () => {
                if (!(await confirm(`Delete ${env.key}?`))) return
                await api.projects.deleteEnv(projectId, env.id)
                await onChange()
                toast('Env var removed.', 'success')
              }}
            >
              Remove
            </button>
          </li>
        ))}
        {envs.length === 0 && <li className="muted">No environment variables yet.</li>}
      </ul>
    </div>
  )
}

function GalleryTab({
  projectId,
  items,
  onChange,
}: {
  projectId: string
  items: import('../api/types').ProjectGalleryItem[]
  onChange: () => Promise<void>
}) {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null)
  const [caption, setCaption] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!mediaAssetId) return
    try {
      await api.projects.addGallery(projectId, { mediaAssetId, caption })
      setMediaAssetId(null)
      setCaption('')
      await onChange()
      toast('Gallery item added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  return (
    <div className="stack-section">
      <form className="card form-grid inline-add" onSubmit={add}>
        <div className="span-2">
          <MediaPicker
            label="Image, GIF, or video"
            value={mediaAssetId}
            onChange={setMediaAssetId}
            filter="gallery"
          />
        </div>
        <label>
          Caption
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
        </label>
        <button type="submit" className="btn primary" disabled={!mediaAssetId}>
          Add to gallery
        </button>
      </form>
      <ul className="item-list card">
        {items.map((item) => (
          <li key={item.id}>
            <div className="gallery-item-preview">
              {item.mediaAsset?.mimeType.startsWith('image/') ? (
                <img src={item.mediaAsset.publicUrl} alt={item.caption || item.mediaAsset.filename} className="image-picker-thumb" />
              ) : item.mediaAsset?.mimeType.startsWith('video/') ? (
                <video src={item.mediaAsset.publicUrl} className="image-picker-thumb" muted playsInline controls />
              ) : (
                <code className="small">{item.mediaAssetId}</code>
              )}
              <div>
                {item.caption && <strong>{item.caption}</strong>}
                {item.mediaAsset ? (
                  <div className="muted small">{item.mediaAsset.filename} · {item.mediaAsset.mimeType}</div>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className="btn small danger"
              onClick={async () => {
                if (!(await confirm('Remove from gallery?'))) return
                await api.projects.deleteGallery(projectId, item.id)
                await onChange()
                toast('Removed from gallery.', 'success')
              }}
            >
              Remove
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="muted">No gallery items yet.</li>}
      </ul>
    </div>
  )
}
