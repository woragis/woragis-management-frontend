import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Project, ProjectDomain, ProjectLink, ProjectSecret } from '../api/types'

type Tab = 'general' | 'links' | 'domains' | 'secrets' | 'gallery'

export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tab, setTab] = useState<Tab>('general')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    const p = await api.projects.get(id)
    setProject(p)
  }, [id])

  useEffect(() => {
    reload()
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [reload])

  async function saveGeneral(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!project) return
    setSaving(true)
    setMessage('')
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      const updated = await api.projects.update(id, {
        name: String(fd.get('name')),
        slug: String(fd.get('slug')),
        status: String(fd.get('status')) as Project['status'],
        shortDescription: String(fd.get('shortDescription')),
        longDescription: String(fd.get('longDescription')),
        description: String(fd.get('description')),
        notes: String(fd.get('notes')),
        repoUrl: String(fd.get('repoUrl')),
        demoUrl: String(fd.get('demoUrl')),
        githubUrl: String(fd.get('githubUrl')),
        publicSlug: String(fd.get('publicSlug')),
        displayOrder: Number(fd.get('displayOrder') || 0),
        stack: String(fd.get('stack'))
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isPublic: fd.get('isPublic') === 'on',
        featured: fd.get('featured') === 'on',
      })
      setProject(updated)
      setMessage('Saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProject() {
    if (!confirm('Delete this project and all related data?')) return
    await api.projects.delete(id)
    navigate('/projects')
  }

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>
  if (error && !project) return <div className="page"><p className="error">{error}</p></div>
  if (!project) return null

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/projects" className="back-link">← Projects</Link>
          <h1>{project.name}</h1>
          <p className="muted">{project.slug}</p>
        </div>
        <button type="button" className="btn danger" onClick={deleteProject}>
          Delete
        </button>
      </header>

      <div className="tabs">
        {(['general', 'links', 'domains', 'secrets', 'gallery'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? 'active' : ''}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {tab === 'general' && (
        <form className="card form-grid" onSubmit={saveGeneral}>
          <label>
            Name
            <input name="name" defaultValue={project.name} required />
          </label>
          <label>
            Slug
            <input name="slug" defaultValue={project.slug} />
          </label>
          <label>
            Status
            <select name="status" defaultValue={project.status}>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <label>
            Display order
            <input name="displayOrder" type="number" defaultValue={project.displayOrder} />
          </label>
          <label>
            Public slug
            <input name="publicSlug" defaultValue={project.publicSlug} placeholder="lokra-crm" />
          </label>
          <label className="full">
            Short description
            <input name="shortDescription" defaultValue={project.shortDescription} />
          </label>
          <label className="full">
            Long description
            <textarea name="longDescription" rows={4} defaultValue={project.longDescription} />
          </label>
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
            <input name="githubUrl" defaultValue={project.githubUrl} />
          </label>
          <label className="checkbox">
            <input name="isPublic" type="checkbox" defaultChecked={project.isPublic} />
            Public on landing
          </label>
          <label className="checkbox">
            <input name="featured" type="checkbox" defaultChecked={project.featured} />
            Featured
          </label>
          <div className="form-actions full">
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      {tab === 'links' && (
        <LinksTab projectId={id} links={project.links ?? []} onChange={reload} />
      )}
      {tab === 'domains' && (
        <DomainsTab projectId={id} domains={project.domains ?? []} onChange={reload} />
      )}
      {tab === 'secrets' && <SecretsTab projectId={id} />}
      {tab === 'gallery' && (
        <GalleryTab projectId={id} items={project.gallery ?? []} onChange={reload} />
      )}
    </div>
  )
}

function LinksTab({
  projectId,
  links,
  onChange,
}: {
  projectId: string
  links: ProjectLink[]
  onChange: () => Promise<void>
}) {
  const [type, setType] = useState('frontend')
  const [url, setUrl] = useState('')
  const [environment, setEnvironment] = useState('production')
  const [label, setLabel] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  async function add(e: FormEvent) {
    e.preventDefault()
    await api.projects.addLink(projectId, { type, url, environment, label, isPublic })
    setUrl('')
    await onChange()
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
                await api.projects.deleteLink(projectId, l.id)
                await onChange()
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

function DomainsTab({
  projectId,
  domains,
  onChange,
}: {
  projectId: string
  domains: ProjectDomain[]
  onChange: () => Promise<void>
}) {
  const [domain, setDomain] = useState('')
  const [registrar, setRegistrar] = useState('')
  const [purpose, setPurpose] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    await api.projects.addDomain(projectId, { domain, registrar, purpose })
    setDomain('')
    await onChange()
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
            </div>
            <button
              type="button"
              className="btn small danger"
              onClick={async () => {
                await api.projects.deleteDomain(projectId, d.id)
                await onChange()
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
    await api.projects.addSecret(projectId, { name, value, service })
    setName('')
    setValue('')
    setSecrets(await api.projects.listSecrets(projectId))
  }

  async function reveal(secretId: string) {
    const s = await api.projects.getSecret(projectId, secretId)
    setRevealed((prev) => ({ ...prev, [secretId]: s.value ?? '' }))
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
              {revealed[s.id] && (
                <code className="secret-value">{revealed[s.id]}</code>
              )}
            </div>
            <div className="row-actions">
              <button type="button" className="btn small" onClick={() => reveal(s.id)}>
                Reveal
              </button>
              <button
                type="button"
                className="btn small danger"
                onClick={async () => {
                  await api.projects.deleteSecret(projectId, s.id)
                  setSecrets(await api.projects.listSecrets(projectId))
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

function GalleryTab({
  projectId,
  items,
  onChange,
}: {
  projectId: string
  items: { id: string; mediaAssetId: string; caption: string; displayOrder: number }[]
  onChange: () => Promise<void>
}) {
  const [mediaAssetId, setMediaAssetId] = useState('')
  const [caption, setCaption] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    await api.projects.addGallery(projectId, { mediaAssetId, caption })
    setMediaAssetId('')
    await onChange()
  }

  return (
    <div className="stack-section">
      <form className="card form-grid inline-add" onSubmit={add}>
        <label className="span-2">
          Media asset ID
          <input required value={mediaAssetId} onChange={(e) => setMediaAssetId(e.target.value)} placeholder="UUID from Media page" />
        </label>
        <label>
          Caption
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
        </label>
        <button type="submit" className="btn primary">Add to gallery</button>
      </form>
      <ul className="item-list card">
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <code>{item.mediaAssetId}</code>
              {item.caption && <span className="muted"> — {item.caption}</span>}
            </div>
            <button
              type="button"
              className="btn small danger"
              onClick={async () => {
                await api.projects.deleteGallery(projectId, item.id)
                await onChange()
              }}
            >
              Remove
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="muted">No gallery items. Upload media first, then paste the asset ID.</li>}
      </ul>
    </div>
  )
}
