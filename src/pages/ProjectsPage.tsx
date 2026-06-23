import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Project, ProjectFilters } from '../api/types'
import {
  PROJECT_INTENTS,
  PROJECT_MATURITY,
  labelFor,
} from '../lib/project-dimensions'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProjectFilters>({})
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.projects
      .list({ ...filters, q: search || undefined })
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [filters, search])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="muted">Manage your programming projects and landing visibility.</p>
        </div>
        <Link to="/projects/new" className="btn primary">
          New project
        </Link>
      </header>

      <div className="card filters-bar">
        <input
          type="search"
          placeholder="Search name, slug, stack…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value || undefined }))
          }
        >
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="paused">paused</option>
          <option value="archived">archived</option>
        </select>
        <select
          value={filters.intent ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, intent: e.target.value || undefined }))}
        >
          <option value="">All intents</option>
          {PROJECT_INTENTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={filters.maturity ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, maturity: e.target.value || undefined }))}
        >
          <option value="">All maturity</option>
          {PROJECT_MATURITY.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={filters.isPublic === undefined ? '' : String(filters.isPublic)}
          onChange={(e) => {
            const v = e.target.value
            setFilters((f) => ({
              ...f,
              isPublic: v === '' ? undefined : v === 'true',
            }))
          }}
        >
          <option value="">Public: any</option>
          <option value="true">Public only</option>
          <option value="false">Private only</option>
        </select>
        <select
          value={filters.featured === undefined ? '' : String(filters.featured)}
          onChange={(e) => {
            const v = e.target.value
            setFilters((f) => ({
              ...f,
              featured: v === '' ? undefined : v === 'true',
            }))
          }}
        >
          <option value="">Featured: any</option>
          <option value="true">Featured</option>
          <option value="false">Not featured</option>
        </select>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Intent</th>
                <th>Maturity</th>
                <th>Status</th>
                <th>Public</th>
                <th>Stack</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No projects match your filters.
                  </td>
                </tr>
              )}
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div className="muted small">{p.slug}</div>
                  </td>
                  <td className="muted small">{labelFor(PROJECT_INTENTS, p.intent || 'portfolio')}</td>
                  <td className="muted small">{labelFor(PROJECT_MATURITY, p.maturity || 'idea')}</td>
                  <td>
                    <span className={`badge ${p.status}`}>{p.status}</span>
                  </td>
                  <td>{p.isPublic ? 'Yes' : 'No'}</td>
                  <td className="stack-cell">
                    {(p.stack ?? []).slice(0, 3).join(', ')}
                  </td>
                  <td>
                    <Link to={`/projects/${p.id}`} className="btn small">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
