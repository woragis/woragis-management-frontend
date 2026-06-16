import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Dashboard } from '../api/types'

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard
      .get()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  if (error) return <div className="page"><p className="error">{error}</p></div>
  if (!data) return <div className="page"><p className="muted">Loading…</p></div>

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of your programming portfolio.</p>
        </div>
        <Link to="/projects/new" className="btn primary">
          New project
        </Link>
      </header>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-value">{data.projectCount}</span>
          <span className="muted">Projects</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{data.activeProjectCount}</span>
          <span className="muted">Active</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{data.publicProjectCount}</span>
          <span className="muted">Public</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{data.mediaCount}</span>
          <span className="muted">Media assets</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Secrets expiring (30 days)</h2>
          {data.secretsExpiringSoon.length === 0 ? (
            <p className="muted">None expiring soon.</p>
          ) : (
            <ul className="item-list">
              {data.secretsExpiringSoon.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.name}</strong>
                    <div className="muted small">
                      <Link to={`/projects/${s.projectId}`}>Open project</Link>
                      {s.expiresAt && ` · ${new Date(s.expiresAt).toLocaleDateString()}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Domains expiring (30 days)</h2>
          {data.domainsExpiringSoon.length === 0 ? (
            <p className="muted">None expiring soon.</p>
          ) : (
            <ul className="item-list">
              {data.domainsExpiringSoon.map((d) => (
                <li key={d.id}>
                  <div>
                    <strong>{d.domain}</strong>
                    <div className="muted small">
                      <Link to={`/projects/${d.projectId}`}>Open project</Link>
                      {d.expiresAt && ` · ${new Date(d.expiresAt).toLocaleDateString()}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
