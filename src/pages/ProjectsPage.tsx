import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Project } from '../api/types'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.projects
      .list()
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

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

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Public</th>
                <th>Featured</th>
                <th>Stack</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No projects yet.
                  </td>
                </tr>
              )}
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div className="muted small">{p.slug}</div>
                  </td>
                  <td>
                    <span className={`badge ${p.status}`}>{p.status}</span>
                  </td>
                  <td>{p.isPublic ? 'Yes' : 'No'}</td>
                  <td>{p.featured ? '★' : '—'}</td>
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
