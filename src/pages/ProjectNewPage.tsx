import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { ProjectIntent } from '../api/types'
import { PROJECT_INTENTS } from '../lib/project-dimensions'

export function ProjectNewPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [stack, setStack] = useState('')
  const [intent, setIntent] = useState('portfolio')
  const [isPublic, setIsPublic] = useState(false)
  const [featured, setFeatured] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const project = await api.projects.create({
        name,
        slug: slug || undefined,
        shortDescription,
        stack: stack
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        intent: intent as ProjectIntent,
        isPublic,
        featured,
      })
      navigate(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/projects" className="back-link">
            ← Projects
          </Link>
          <h1>New project</h1>
        </div>
      </header>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <label>
          Name *
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Slug
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" />
        </label>
        <label className="full">
          Short description
          <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        </label>
        <label className="full">
          Stack (comma-separated)
          <input value={stack} onChange={(e) => setStack(e.target.value)} placeholder="Go, Next.js, PostgreSQL" />
        </label>
        <label>
          Intent
          <select value={intent} onChange={(e) => setIntent(e.target.value)}>
            {PROJECT_INTENTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Public on landing
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
        {error && <p className="error full">{error}</p>}
        <div className="form-actions full">
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  )
}
