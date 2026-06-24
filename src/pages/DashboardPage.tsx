import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Dashboard } from '../api/types'

const MATURITY_LABELS: Record<string, string> = {
  idea: 'Idea',
  building: 'Building',
  mvp: 'MVP',
  launched: 'Launched',
  maintenance: 'Maintenance',
  sunset: 'Sunset',
}

const INTENT_LABELS: Record<string, string> = {
  commercial: 'Commercial',
  academic: 'Academic',
  personal_tool: 'Personal tool',
  portfolio: 'Portfolio',
  hobby: 'Hobby',
  nonprofit: 'Nonprofit',
}

function filterLink(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) q.set(k, v)
  }
  const s = q.toString()
  return s ? `/projects?${s}` : '/projects'
}

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
          <h2>By maturity</h2>
          {(data.byMaturity ?? []).length === 0 ? (
            <p className="muted">No projects yet.</p>
          ) : (
            <ul className="item-list">
              {(data.byMaturity ?? []).map((row) => (
                <li key={row.key}>
                  <Link to={filterLink({ maturity: row.key })}>
                    <strong>{MATURITY_LABELS[row.key] ?? row.key}</strong>
                    <span className="muted small"> · {row.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>By intent</h2>
          {(data.byIntent ?? []).length === 0 ? (
            <p className="muted">No projects yet.</p>
          ) : (
            <ul className="item-list">
              {(data.byIntent ?? []).map((row) => (
                <li key={row.key}>
                  <Link to={filterLink({ intent: row.key })}>
                    <strong>{INTENT_LABELS[row.key] ?? row.key}</strong>
                    <span className="muted small"> · {row.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Quick filters</h2>
          <div className="row-actions" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <Link to={filterLink({ status: 'active' })} className="btn ghost">
              Active projects
            </Link>
            <Link to={filterLink({ isPublic: 'true' })} className="btn ghost">
              Public
            </Link>
            <Link to={filterLink({ featured: 'true' })} className="btn ghost">
              Featured
            </Link>
            <Link to={filterLink({ maturity: 'mvp' })} className="btn ghost">
              MVPs
            </Link>
            <Link to={filterLink({ maturity: 'launched' })} className="btn ghost">
              Launched
            </Link>
          </div>
        </section>
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
