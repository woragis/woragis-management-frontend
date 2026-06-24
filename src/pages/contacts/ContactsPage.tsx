import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import type { Contact, ContactFilters } from '../../api/types'
import { useToast } from '../../context/ToastContext'

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ContactsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ContactFilters>({})

  const reload = useCallback(async () => {
    const data = await api.contacts.list({
      ...filters,
      q: search || undefined,
    })
    setRows(data)
  }, [filters, search])

  useEffect(() => {
    const t = setTimeout(() => {
      reload()
        .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
        .finally(() => setLoading(false))
    }, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [reload, search, toast])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await api.contacts.create({
        name: String(fd.get('name')),
        displayName: String(fd.get('displayName') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        organization: String(fd.get('organization') || ''),
        roleTitle: String(fd.get('roleTitle') || ''),
        relationship: String(fd.get('relationship') || 'other') as Contact['relationship'],
        stage: String(fd.get('stage') || 'cold') as Contact['stage'],
        source: String(fd.get('source') || ''),
        notes: String(fd.get('notes') || ''),
        tags: parseTags(String(fd.get('tags') || '')),
        active: true,
      })
      e.currentTarget.reset()
      await reload()
      toast('Contact created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Contacts</h1>
          <p className="muted">CRM for leads, clients, investors, and partners.</p>
        </div>
      </header>

      <form className="card form-grid" onSubmit={onCreate}>
        <h2 className="full">Add contact</h2>
        <label>
          Name
          <input name="name" required placeholder="Claudio" />
        </label>
        <label>
          Display name
          <input name="displayName" placeholder="Claudio — Professor, UNIPE" />
        </label>
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <label>
          Phone
          <input name="phone" />
        </label>
        <label>
          Organization
          <input name="organization" placeholder="UNIPE" />
        </label>
        <label>
          Role
          <input name="roleTitle" placeholder="Professor" />
        </label>
        <label>
          Relationship
          <select name="relationship" defaultValue="other">
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="client">Client</option>
            <option value="investor">Investor</option>
            <option value="partner">Partner</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Stage
          <select name="stage" defaultValue="cold">
            <option value="cold">Cold</option>
            <option value="warm">Warm</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>
        </label>
        <label>
          Source
          <input name="source" placeholder="LinkedIn, event" />
        </label>
        <label className="full">
          Tags (comma-separated)
          <input name="tags" placeholder="saas, notes-app" />
        </label>
        <label className="full">
          Notes
          <input name="notes" />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">
            Add
          </button>
        </div>
      </form>

      <section className="card">
        <div className="filters-bar" style={{ marginBottom: '1rem' }}>
          <input
            type="search"
            placeholder="Search name, org, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filters.relationship ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, relationship: e.target.value || undefined }))
            }
          >
            <option value="">All relationships</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="client">Client</option>
            <option value="investor">Investor</option>
            <option value="partner">Partner</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filters.stage ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value || undefined }))}
          >
            <option value="">All stages</option>
            <option value="cold">Cold</option>
            <option value="warm">Warm</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>
        </div>

        {rows.length === 0 ? (
          <p className="muted">No contacts found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>Relationship</th>
                <th>Stage</th>
                <th>Follow-up</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/contacts/${r.id}`}>
                      <strong>{r.displayName || r.name}</strong>
                    </Link>
                    {r.displayName && r.displayName !== r.name ? (
                      <div className="muted small">{r.name}</div>
                    ) : null}
                  </td>
                  <td className="muted small">
                    {r.organization || '—'}
                    {r.roleTitle ? ` · ${r.roleTitle}` : ''}
                  </td>
                  <td>{r.relationship}</td>
                  <td>{r.stage}</td>
                  <td className="muted small">
                    {r.nextFollowUpAt
                      ? new Date(r.nextFollowUpAt).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td>
                    <Link to={`/contacts/${r.id}`} className="btn ghost">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
